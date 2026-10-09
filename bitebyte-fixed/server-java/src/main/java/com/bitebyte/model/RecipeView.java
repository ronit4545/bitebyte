package com.bitebyte.model;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

/** A recipe plus its computed rating summary (what the frontend receives). */
public class RecipeView {
    private final Recipe recipe;
    private final double averageRating;
    private final int reviewCount;

    public RecipeView(Recipe recipe, double averageRating, int reviewCount) {
        this.recipe = recipe;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    @JsonUnwrapped
    public Recipe getRecipe() { return recipe; }
    public double getAverageRating() { return averageRating; }
    public int getReviewCount() { return reviewCount; }
}
