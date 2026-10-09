package com.bitebyte.controller;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.Recipe;
import com.bitebyte.model.RecipeView;
import com.bitebyte.model.Review;
import com.bitebyte.model.User;
import com.bitebyte.security.AuthService;
import com.bitebyte.service.JsonDatabase;
import com.bitebyte.service.RecipeService;
import com.bitebyte.service.Util;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Recipe sharing, discovery (search + filters), editing and deletion. */
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private static final List<String> DEFAULT_IMAGES = List.of(
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80");

    private final JsonDatabase db;
    private final AuthService auth;
    private final RecipeService recipes;
    private final Random random = new Random();

    public RecipeController(JsonDatabase db, AuthService auth, RecipeService recipes) {
        this.db = db;
        this.auth = auth;
        this.recipes = recipes;
    }

    private static boolean contains(String text, String q) {
        return text != null && text.toLowerCase().contains(q);
    }

    /** Discover Recipes: only approved recipes, with optional search and filters. */
    @GetMapping
    public Map<String, Object> discover(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String difficulty,
                                        @RequestParam(required = false) String maxCookTime,
                                        @RequestParam(required = false) String minRating,
                                        @RequestParam(required = false) String tag,
                                        @RequestParam(defaultValue = "newest") String sort) {
        List<RecipeView> list = new ArrayList<>();
        for (Recipe r : db.data().getRecipes()) {
            if ("approved".equals(r.getStatus())) list.add(recipes.enrich(r));
        }

        if (Util.hasText(search)) {
            String q = search.trim().toLowerCase();
            list.removeIf(v -> {
                Recipe r = v.getRecipe();
                return !(contains(r.getTitle(), q) || contains(r.getDescription(), q) || contains(r.getCategory(), q)
                        || (r.getTags() != null && r.getTags().stream().anyMatch(t -> contains(t, q)))
                        || (r.getIngredients() != null && r.getIngredients().stream().anyMatch(i -> contains(i, q))));
            });
        }
        if (Util.hasText(category) && !category.equals("All")) {
            list.removeIf(v -> !category.equalsIgnoreCase(v.getRecipe().getCategory()));
        }
        if (Util.hasText(difficulty) && !difficulty.equals("All")) {
            list.removeIf(v -> !difficulty.equalsIgnoreCase(v.getRecipe().getDifficulty()));
        }
        Integer maxTime = Util.parseInt(maxCookTime);
        if (Util.hasText(maxCookTime) && maxTime != null) {
            list.removeIf(v -> v.getRecipe().getCookTime() + v.getRecipe().getPrepTime() > maxTime);
        }
        Double minStars = Util.parseDouble(minRating);
        if (Util.hasText(minRating) && minStars != null) {
            list.removeIf(v -> v.getAverageRating() < minStars);
        }
        if (Util.hasText(tag)) {
            list.removeIf(v -> v.getRecipe().getTags() == null || !v.getRecipe().getTags().contains(tag));
        }

        switch (sort) {
            case "top_rated" -> list.sort(Comparator.comparingDouble(RecipeView::getAverageRating).reversed()
                    .thenComparing(Comparator.comparingInt(RecipeView::getReviewCount).reversed()));
            case "popular" -> list.sort(Comparator.comparingInt((RecipeView v) -> v.getRecipe().getViews()).reversed());
            case "fastest" -> list.sort(Comparator.comparingInt(
                    (RecipeView v) -> v.getRecipe().getPrepTime() + v.getRecipe().getCookTime()));
            default -> list.sort(Comparator.comparing(
                    (RecipeView v) -> Util.time(v.getRecipe().getCreatedAt())).reversed());
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("total", list.size());
        res.put("recipes", list);
        return res;
    }

    /** User Dashboard: My Recipes. */
    @GetMapping("/my-recipes")
    public List<RecipeView> myRecipes(HttpServletRequest request) {
        User user = auth.authenticate(request);
        return db.data().getRecipes().stream()
                .filter(r -> r.getAuthorId().equals(user.getId()))
                .sorted(Comparator.comparing((Recipe r) -> Util.time(r.getCreatedAt())).reversed())
                .map(recipes::enrich)
                .toList();
    }

    /** User Dashboard: Recipe Sharing History (status + admin feedback). */
    @GetMapping("/history")
    public List<Map<String, Object>> history(HttpServletRequest request) {
        User user = auth.authenticate(request);
        List<Map<String, Object>> out = new ArrayList<>();
        db.data().getRecipes().stream()
                .filter(r -> r.getAuthorId().equals(user.getId()))
                .sorted(Comparator.comparing((Recipe r) -> Util.time(r.getCreatedAt())).reversed())
                .forEach(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("title", r.getTitle());
                    m.put("category", r.getCategory());
                    m.put("imageUrl", r.getImageUrl());
                    m.put("status", r.getStatus());
                    m.put("adminFeedback", r.getAdminFeedback() == null ? "" : r.getAdminFeedback());
                    m.put("submittedAt", r.getCreatedAt());
                    m.put("updatedAt", r.getUpdatedAt());
                    m.put("views", r.getViews());
                    out.add(m);
                });
        return out;
    }

    @GetMapping("/{id}")
    public Map<String, Object> details(@PathVariable String id) {
        Recipe recipe = find(id);
        recipe.setViews(recipe.getViews() + 1);
        db.save();

        List<Review> reviews = db.data().getRatings().stream()
                .filter(r -> r.getRecipeId().equals(recipe.getId()))
                .sorted(Comparator.comparing((Review r) -> Util.time(r.getCreatedAt())).reversed())
                .toList();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("recipe", recipes.enrich(recipe));
        res.put("reviews", reviews);
        return res;
    }

    /** Recipe Sharing: create a new recipe (pending approval unless auto-approve / admin). */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(HttpServletRequest request,
                                                      @RequestBody(required = false) Map<String, Object> body) {
        User user = auth.authenticate(request);
        String title = Util.str(body, "title");
        Object ingredients = body == null ? null : body.get("ingredients");
        Object instructions = body == null ? null : body.get("instructions");

        if (!Util.hasText(title) || !Util.truthy(ingredients) || !Util.truthy(instructions)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Title, ingredients, and instructions are required.");
        }

        boolean approved = db.data().getSettings().isAutoApproveRecipes() || "admin".equals(user.getRole());
        String status = approved ? "approved" : "pending";

        String description = Util.str(body, "description");
        String category = Util.str(body, "category");
        String difficulty = Util.str(body, "difficulty");
        String imageUrl = Util.str(body, "imageUrl");
        Integer prep = Util.parseInt(body.get("prepTime"));
        Integer cook = Util.parseInt(body.get("cookTime"));
        Integer servings = Util.parseInt(body.get("servings"));

        Recipe r = new Recipe();
        r.setId(Util.shortId("rec-"));
        r.setTitle(title.trim());
        r.setDescription(description != null ? description.trim() : "");
        r.setCategory(Util.truthy(category) ? category : "General");
        r.setPrepTime(prep != null && prep != 0 ? prep : 15);
        r.setCookTime(cook != null && cook != 0 ? cook : 20);
        r.setServings(servings != null && servings != 0 ? servings : 4);
        r.setDifficulty(Util.truthy(difficulty) ? difficulty : "Medium");
        r.setIngredients(Util.toStringList(ingredients));
        r.setInstructions(Util.toStringList(instructions));
        r.setTags(body.get("tags") instanceof List<?> t ? Util.asStrings(t) : new ArrayList<String>());
        r.setImageUrl(Util.hasText(imageUrl) ? imageUrl.trim()
                : DEFAULT_IMAGES.get(random.nextInt(DEFAULT_IMAGES.size())));
        r.setAuthorId(user.getId());
        r.setAuthorName(user.getName());
        r.setAuthorAvatar(user.getAvatar());
        r.setStatus(status);
        r.setAdminFeedback(approved ? "Auto-approved by platform settings." : "");
        r.setViews(0);
        r.setCreatedAt(Util.now());
        r.setUpdatedAt(r.getCreatedAt());

        db.data().getRecipes().add(0, r);
        db.logActivity("recipe_submitted", user, "Shared new recipe: \"" + r.getTitle() + "\". Status: " + status + ".");
        db.save();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", approved
                ? "Recipe published successfully! It is now live for all foodies to discover."
                : "Recipe shared successfully! It has been submitted for administrator approval.");
        res.put("recipe", recipes.enrich(r));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(HttpServletRequest request, @PathVariable String id,
                                      @RequestBody(required = false) Map<String, Object> body) {
        User user = auth.authenticate(request);
        Recipe r = find(id);
        if (!r.getAuthorId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to edit this recipe.");
        }
        if (body == null) body = Map.of();

        String title = Util.str(body, "title");
        String description = Util.str(body, "description");
        String category = Util.str(body, "category");
        String difficulty = Util.str(body, "difficulty");
        String imageUrl = Util.str(body, "imageUrl");

        if (Util.hasText(title)) r.setTitle(title.trim());
        if (description != null) r.setDescription(description.trim());
        if (Util.truthy(category)) r.setCategory(category);
        Integer prep = Util.parseInt(body.get("prepTime"));
        Integer cook = Util.parseInt(body.get("cookTime"));
        Integer servings = Util.parseInt(body.get("servings"));
        if (prep != null) r.setPrepTime(prep);
        if (cook != null) r.setCookTime(cook);
        if (servings != null) r.setServings(servings);
        if (Util.truthy(difficulty)) r.setDifficulty(difficulty);
        if (Util.hasText(imageUrl)) r.setImageUrl(imageUrl.trim());

        Object ingredients = body.get("ingredients");
        if (Util.truthy(ingredients) && (ingredients instanceof List || ingredients instanceof String)) {
            r.setIngredients(Util.toStringList(ingredients));
        }
        Object instructions = body.get("instructions");
        if (Util.truthy(instructions) && (instructions instanceof List || instructions instanceof String)) {
            r.setInstructions(Util.toStringList(instructions));
        }
        if (body.get("tags") instanceof List<?> tags) {
            r.setTags(Util.asStrings(tags));
        }

        r.setUpdatedAt(Util.now());
        db.save();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Recipe updated successfully!");
        res.put("recipe", recipes.enrich(r));
        return res;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(HttpServletRequest request, @PathVariable String id) {
        User user = auth.authenticate(request);
        Recipe r = find(id);
        if (!r.getAuthorId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to delete this recipe.");
        }
        db.data().getRecipes().remove(r);
        db.data().getRatings().removeIf(rev -> rev.getRecipeId().equals(id));
        db.logActivity("recipe_deleted", user, "Deleted recipe \"" + r.getTitle() + "\".");
        db.save();
        return Map.of("message", "Recipe deleted successfully!");
    }

    private Recipe find(String id) {
        return db.data().getRecipes().stream().filter(r -> r.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipe not found."));
    }
}
