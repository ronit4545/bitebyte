package com.bitebyte.service;

import com.bitebyte.model.Recipe;
import com.bitebyte.model.RecipeView;
import com.bitebyte.model.Review;
import java.util.List;
import org.springframework.stereotype.Service;

/** Shared recipe logic (rating summary). */
@Service
public class RecipeService {
    private final JsonDatabase db;

    public RecipeService(JsonDatabase db) {
        this.db = db;
    }

    public RecipeView enrich(Recipe recipe) {
        List<Review> reviews = db.data().getRatings().stream()
                .filter(r -> r.getRecipeId().equals(recipe.getId())).toList();
        int count = reviews.size();
        double avg = 0;
        if (count > 0) {
            double sum = 0;
            for (Review r : reviews) sum += r.getRating();
            avg = Math.round(sum / count * 10.0) / 10.0;
        }
        return new RecipeView(recipe, avg, count);
    }
}
