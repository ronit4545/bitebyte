package com.bitebyte.controller;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.Recipe;
import com.bitebyte.model.Review;
import com.bitebyte.model.User;
import com.bitebyte.security.AuthService;
import com.bitebyte.service.JsonDatabase;
import com.bitebyte.service.Util;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Rate and comment on recipes. */
@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    private final JsonDatabase db;
    private final AuthService auth;

    public RatingController(JsonDatabase db, AuthService auth) {
        this.db = db;
        this.auth = auth;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(HttpServletRequest request,
                                                      @RequestBody(required = false) Map<String, Object> body) {
        User user = auth.authenticate(request);
        String recipeId = Util.str(body, "recipeId");
        String comment = Util.str(body, "comment");

        if (!Util.hasText(recipeId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Recipe ID is required.");
        }
        Recipe recipe = db.data().getRecipes().stream().filter(r -> r.getId().equals(recipeId)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipe not found."));

        Integer stars = Util.parseInt(body == null ? null : body.get("rating"));
        if (stars == null || stars < 1 || stars > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be an integer between 1 and 5 stars.");
        }
        if (!Util.hasText(comment)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please share your comment or review feedback.");
        }

        Review existing = db.data().getRatings().stream()
                .filter(r -> r.getRecipeId().equals(recipeId) && r.getUserId().equals(user.getId()))
                .findFirst().orElse(null);

        Review result;
        if (existing != null) {
            existing.setRating(stars);
            existing.setComment(comment.trim());
            existing.setCreatedAt(Util.now());
            result = existing;
            db.logActivity("recipe_reviewed", user, "Updated review (" + stars + " stars) on \"" + recipe.getTitle() + "\".");
        } else {
            result = new Review();
            result.setId(Util.shortId("rat-"));
            result.setRecipeId(recipeId);
            result.setUserId(user.getId());
            result.setUserName(user.getName());
            result.setUserAvatar(user.getAvatar());
            result.setRating(stars);
            result.setComment(comment.trim());
            result.setCreatedAt(Util.now());
            db.data().getRatings().add(0, result);
            db.logActivity("recipe_reviewed", user,
                    "Rated " + stars + " stars & commented on \"" + recipe.getTitle() + "\".");
        }
        db.save();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Thank you! Your rating and comment have been submitted successfully.");
        res.put("review", result);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/my-ratings")
    public List<Map<String, Object>> myRatings(HttpServletRequest request) {
        User user = auth.authenticate(request);
        List<Review> mine = new ArrayList<>(db.data().getRatings().stream()
                .filter(r -> r.getUserId().equals(user.getId())).toList());
        mine.sort(Comparator.comparing((Review r) -> Util.time(r.getCreatedAt())).reversed());

        List<Map<String, Object>> out = new ArrayList<>();
        for (Review rev : mine) {
            Recipe recipe = db.data().getRecipes().stream()
                    .filter(r -> r.getId().equals(rev.getRecipeId())).findFirst().orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rev.getId());
            m.put("recipeId", rev.getRecipeId());
            m.put("userId", rev.getUserId());
            m.put("userName", rev.getUserName());
            m.put("userAvatar", rev.getUserAvatar());
            m.put("rating", rev.getRating());
            m.put("comment", rev.getComment());
            m.put("createdAt", rev.getCreatedAt());
            m.put("recipeTitle", recipe != null ? recipe.getTitle() : "Recipe No Longer Available");
            m.put("recipeImage", recipe != null ? recipe.getImageUrl() : "");
            m.put("recipeCategory", recipe != null ? recipe.getCategory() : "General");
            out.add(m);
        }
        return out;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(HttpServletRequest request, @PathVariable String id) {
        User user = auth.authenticate(request);
        Review review = db.data().getRatings().stream().filter(r -> r.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Rating/comment not found."));

        if (!review.getUserId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment.");
        }
        db.data().getRatings().remove(review);
        db.save();
        return Map.of("message", "Rating and comment deleted successfully!");
    }
}
