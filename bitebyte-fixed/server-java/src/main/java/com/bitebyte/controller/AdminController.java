package com.bitebyte.controller;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.Activity;
import com.bitebyte.model.Recipe;
import com.bitebyte.model.RecipeView;
import com.bitebyte.model.Review;
import com.bitebyte.model.Settings;
import com.bitebyte.model.User;
import com.bitebyte.security.AuthService;
import com.bitebyte.service.ActivityStream;
import com.bitebyte.service.JsonDatabase;
import com.bitebyte.service.RecipeService;
import com.bitebyte.service.Util;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Admin: recipe moderation, system settings, statistics and live activity monitoring. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final JsonDatabase db;
    private final AuthService auth;
    private final RecipeService recipeService;
    private final ActivityStream stream;

    public AdminController(JsonDatabase db, AuthService auth, RecipeService recipeService, ActivityStream stream) {
        this.db = db;
        this.auth = auth;
        this.recipeService = recipeService;
        this.stream = stream;
    }

    /** Recipe Management: list recipes (pending first) with optional status/search filters. */
    @GetMapping("/recipes")
    public List<RecipeView> recipes(HttpServletRequest request,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) String search) {
        auth.requireAdmin(request);
        List<RecipeView> list = new ArrayList<>();
        for (Recipe r : db.data().getRecipes()) list.add(recipeService.enrich(r));

        if (Util.hasText(status) && !status.equals("all")) {
            list.removeIf(v -> !status.equals(v.getRecipe().getStatus()));
        }
        if (Util.hasText(search)) {
            String q = search.trim().toLowerCase();
            list.removeIf(v -> {
                Recipe r = v.getRecipe();
                return !(r.getTitle().toLowerCase().contains(q)
                        || (r.getAuthorName() != null && r.getAuthorName().toLowerCase().contains(q))
                        || (r.getCategory() != null && r.getCategory().toLowerCase().contains(q)));
            });
        }
        list.sort((a, b) -> {
            boolean ap = "pending".equals(a.getRecipe().getStatus());
            boolean bp = "pending".equals(b.getRecipe().getStatus());
            if (ap && !bp) return -1;
            if (bp && !ap) return 1;
            return Util.time(b.getRecipe().getCreatedAt()).compareTo(Util.time(a.getRecipe().getCreatedAt()));
        });
        return list;
    }

    /** Approve / reject a recipe, with optional feedback for the author. */
    @PutMapping("/recipes/{id}/status")
    public Map<String, Object> setStatus(HttpServletRequest request, @PathVariable String id,
                                         @RequestBody(required = false) Map<String, Object> body) {
        User admin = auth.requireAdmin(request);
        String status = Util.str(body, "status");
        String feedback = Util.str(body, "adminFeedback");

        if (status == null || !List.of("approved", "rejected", "pending").contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status. Must be approved, rejected, or pending.");
        }
        Recipe recipe = db.data().getRecipes().stream().filter(r -> r.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipe not found."));

        recipe.setStatus(status);
        if (feedback != null) recipe.setAdminFeedback(feedback.trim());
        recipe.setUpdatedAt(Util.now());

        if (status.equals("approved")) {
            db.logActivity("recipe_approved", admin,
                    "Admin approved recipe \"" + recipe.getTitle() + "\" by " + recipe.getAuthorName() + ".");
        } else if (status.equals("rejected")) {
            db.logActivity("recipe_rejected", admin, "Admin rejected recipe \"" + recipe.getTitle()
                    + "\". Reason: " + (Util.hasText(feedback) ? feedback : "Needs revision") + ".");
        }
        db.save();

        String message = switch (status) {
            case "approved" -> "Recipe approval status: APPROVED. \"" + recipe.getTitle() + "\" is now publicly visible.";
            case "rejected" -> "Recipe approval status: REJECTED. Feedback has been sent to the author.";
            default -> "Recipe approval status: PENDING. \"" + recipe.getTitle() + "\" marked for review.";
        };

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", message);
        res.put("recipeApprovalStatus", status);
        res.put("recipe", recipeService.enrich(recipe));
        return res;
    }

    @GetMapping("/settings")
    public Settings getSettings(HttpServletRequest request) {
        auth.requireAdmin(request);
        return db.data().getSettings();
    }

    @PutMapping("/settings")
    public Map<String, Object> updateSettings(HttpServletRequest request,
                                              @RequestBody(required = false) Map<String, Object> body) {
        User admin = auth.requireAdmin(request);
        if (body == null) body = Map.of();
        Settings s = db.data().getSettings();

        String platformName = Util.str(body, "platformName");
        String tagline = Util.str(body, "tagline");
        String contactEmail = Util.str(body, "contactEmail");
        String banner = Util.str(body, "bannerNotice");

        if (Util.hasText(platformName)) s.setPlatformName(platformName.trim());
        if (tagline != null) s.setTagline(tagline.trim());
        if (body.containsKey("allowRegistration")) s.setAllowRegistration(Util.truthy(body.get("allowRegistration")));
        if (body.containsKey("autoApproveRecipes")) s.setAutoApproveRecipes(Util.truthy(body.get("autoApproveRecipes")));
        if (body.containsKey("maxUploadSizeMB") && body.get("maxUploadSizeMB") != null) {
            Double size = Util.parseDouble(body.get("maxUploadSizeMB").toString());
            if (size != null) s.setMaxUploadSizeMB(size.intValue());
        }
        if (body.containsKey("maintenanceMode")) s.setMaintenanceMode(Util.truthy(body.get("maintenanceMode")));
        if (Util.hasText(contactEmail)) s.setContactEmail(contactEmail.trim());
        if (banner != null) s.setBannerNotice(banner.trim());
        if (body.get("categories") instanceof List<?> cats) {
            s.setCategories(Util.asStrings(cats));
        }

        db.logActivity("settings_updated", admin, "System configurations and settings were updated by admin.");
        db.save();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "System settings updated successfully!");
        res.put("settings", s);
        return res;
    }

    /** Recipe Statistics: KPIs, category breakdown, rating distribution, trends, leaderboards. */
    @GetMapping("/statistics")
    public Map<String, Object> statistics(HttpServletRequest request) {
        auth.requireAdmin(request);
        List<Recipe> recipes = db.data().getRecipes();
        List<Review> ratings = db.data().getRatings();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalRecipes", recipes.size());
        metrics.put("approvedRecipes", recipes.stream().filter(r -> "approved".equals(r.getStatus())).count());
        metrics.put("pendingRecipes", recipes.stream().filter(r -> "pending".equals(r.getStatus())).count());
        metrics.put("rejectedRecipes", recipes.stream().filter(r -> "rejected".equals(r.getStatus())).count());
        metrics.put("totalUsers", db.data().getUsers().size());
        metrics.put("totalComments", ratings.size());
        double avg = ratings.isEmpty() ? 0
                : Math.round(ratings.stream().mapToInt(Review::getRating).sum() * 100.0 / ratings.size()) / 100.0;
        metrics.put("avgRating", avg);

        // Category breakdown (most common first)
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Recipe r : recipes) {
            counts.merge(Util.hasText(r.getCategory()) ? r.getCategory() : "Uncategorized", 1, Integer::sum);
        }
        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        counts.forEach((cat, n) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", cat);
            m.put("count", n);
            categoryBreakdown.add(m);
        });
        categoryBreakdown.sort((a, b) -> (Integer) b.get("count") - (Integer) a.get("count"));

        // Ratings distribution 5 -> 1 stars
        List<Map<String, Object>> distribution = new ArrayList<>();
        for (int stars = 5; stars >= 1; stars--) {
            final int s = stars;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("stars", s);
            m.put("count", ratings.stream().filter(r -> r.getRating() == s).count());
            distribution.add(m);
        }

        // Submission trend (same demo-style data as the original server)
        String[] months = {"Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026"};
        List<Map<String, Object>> trend = new ArrayList<>();
        java.util.Random rnd = new java.util.Random();
        for (String month : months) {
            int count = switch (month) {
                case "Jan 2026" -> 2;
                case "Feb 2026" -> 3;
                case "Mar 2026" -> 6;
                case "Apr 2026" -> {
                    long n = recipes.stream().filter(r -> r.getCreatedAt() != null && r.getCreatedAt().startsWith("2026-04")).count();
                    yield n > 0 ? (int) n : 2;
                }
                default -> 0;
            };
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", month);
            m.put("submissions", count > 0 ? count : rnd.nextInt(3) + 1);
            m.put("comments", (int) Math.floor(count * 1.5) + 1);
            trend.add(m);
        }

        // Top 5 rated approved recipes
        List<RecipeView> approved = new ArrayList<>();
        for (Recipe r : recipes) if ("approved".equals(r.getStatus())) approved.add(recipeService.enrich(r));
        approved.sort(Comparator.comparingDouble(RecipeView::getAverageRating).reversed()
                .thenComparing(Comparator.comparingInt(RecipeView::getReviewCount).reversed()));
        List<Map<String, Object>> topRated = new ArrayList<>();
        for (RecipeView v : approved.subList(0, Math.min(5, approved.size()))) {
            Recipe r = v.getRecipe();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("title", r.getTitle());
            m.put("authorName", r.getAuthorName());
            m.put("category", r.getCategory());
            m.put("averageRating", v.getAverageRating());
            m.put("reviewCount", v.getReviewCount());
            m.put("views", r.getViews());
            topRated.add(m);
        }

        // Top 5 contributors
        Map<String, Map<String, Object>> contributors = new LinkedHashMap<>();
        for (Recipe r : recipes) {
            Map<String, Object> c = contributors.computeIfAbsent(r.getAuthorId(), k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getAuthorId());
                m.put("name", r.getAuthorName());
                m.put("avatar", r.getAuthorAvatar());
                m.put("recipesCount", 0);
                m.put("approvedCount", 0);
                return m;
            });
            c.put("recipesCount", (Integer) c.get("recipesCount") + 1);
            if ("approved".equals(r.getStatus())) c.put("approvedCount", (Integer) c.get("approvedCount") + 1);
        }
        List<Map<String, Object>> topContributors = new ArrayList<>(contributors.values());
        topContributors.sort((a, b) -> (Integer) b.get("recipesCount") - (Integer) a.get("recipesCount"));

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("metrics", metrics);
        res.put("categoryBreakdown", categoryBreakdown);
        res.put("ratingDistribution", distribution);
        res.put("submissionTrend", trend);
        res.put("topRatedRecipes", topRated);
        res.put("topContributors", topContributors.subList(0, Math.min(5, topContributors.size())));
        return res;
    }

    /** User Activity Monitoring: recent activity log, optionally filtered by type. */
    @GetMapping("/activity")
    public List<Activity> activity(HttpServletRequest request,
                                   @RequestParam(required = false) String type,
                                   @RequestParam(defaultValue = "50") String limit) {
        auth.requireAdmin(request);
        List<Activity> logs = new ArrayList<>(db.data().getActivityLogs());
        if (Util.hasText(type) && !type.equals("all")) {
            logs.removeIf(l -> !type.equals(l.getType()));
        }
        Integer max = Util.parseInt(limit);
        int n = max == null ? 50 : Math.max(0, max);
        return logs.subList(0, Math.min(n, logs.size()));
    }

    /** Real-time activity feed using Server-Sent Events. */
    @GetMapping(value = "/activity/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter activityStream(HttpServletRequest request) {
        auth.requireAdmin(request);
        return stream.subscribe();
    }
}
