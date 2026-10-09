import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to compute rating metrics for a recipe
export const enrichRecipe = (recipe) => {
  const recipeRatings = db.data.ratings.filter(r => r.recipeId === recipe.id);
  const reviewCount = recipeRatings.length;
  const averageRating = reviewCount > 0
    ? Number((recipeRatings.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : 0;

  return {
    ...recipe,
    averageRating,
    reviewCount
  };
};

// 2. Discover Recipes:
// Input: Search and filter criteria
// Output: List of recipes
// Functionality: Search and discover new recipes.
router.get('/', (req, res) => {
  const {
    search,
    category,
    difficulty,
    maxCookTime,
    minRating,
    tag,
    sort = 'newest'
  } = req.query;

  // By default, public discovery only returns 'approved' recipes
  let recipes = db.data.recipes
    .filter(r => r.status === 'approved')
    .map(enrichRecipe);

  // Search filter
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    recipes = recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(q))) ||
      (Array.isArray(r.ingredients) && r.ingredients.some(ing =>
        (typeof ing === 'string' ? ing : ing.name).toLowerCase().includes(q)
      ))
    );
  }

  // Category filter
  if (category && category !== 'All') {
    recipes = recipes.filter(r => r.category && r.category.toLowerCase() === category.toLowerCase());
  }

  // Difficulty filter
  if (difficulty && difficulty !== 'All') {
    recipes = recipes.filter(r => r.difficulty && r.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  // Max Cook Time
  if (maxCookTime) {
    const max = parseInt(maxCookTime, 10);
    if (!isNaN(max)) {
      recipes = recipes.filter(r => (r.cookTime + (r.prepTime || 0)) <= max);
    }
  }

  // Minimum Rating filter
  if (minRating) {
    const min = parseFloat(minRating);
    if (!isNaN(min)) {
      recipes = recipes.filter(r => r.averageRating >= min);
    }
  }

  // Tag filter
  if (tag) {
    recipes = recipes.filter(r => Array.isArray(r.tags) && r.tags.includes(tag));
  }

  // Sorting
  if (sort === 'top_rated') {
    recipes.sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
  } else if (sort === 'popular') {
    recipes.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === 'fastest') {
    recipes.sort((a, b) => ((a.prepTime || 0) + a.cookTime) - ((b.prepTime || 0) + b.cookTime));
  } else {
    // Default newest
    recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    total: recipes.length,
    recipes
  });
});

// User Dashboard: 1. My Recipes (Table listing recipes shared by the user)
router.get('/my-recipes', authenticateToken, (req, res) => {
  const userRecipes = db.data.recipes
    .filter(r => r.authorId === req.user.id)
    .map(enrichRecipe)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userRecipes);
});

// User Dashboard: 5. Recipe Sharing History (Timeline with status and admin feedback)
router.get('/history', authenticateToken, (req, res) => {
  const history = db.data.recipes
    .filter(r => r.authorId === req.user.id)
    .map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      imageUrl: r.imageUrl,
      status: r.status,
      adminFeedback: r.adminFeedback || '',
      submittedAt: r.createdAt,
      updatedAt: r.updatedAt,
      views: r.views || 0
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  res.json(history);
});

// Get Single Recipe Details
router.get('/:id', (req, res) => {
  const recipe = db.data.recipes.find(r => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  // Increment views
  recipe.views = (recipe.views || 0) + 1;
  db.save();

  const enriched = enrichRecipe(recipe);

  // Also include full reviews for this recipe
  const reviews = db.data.ratings
    .filter(rat => rat.recipeId === recipe.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    recipe: enriched,
    reviews
  });
});

// 1. Recipe Sharing:
// Input: Recipe details (title, ingredients, instructions, photos, etc.)
// Output: Confirmation message for successful recipe sharing
// Functionality: Share and manage personal recipes.
router.post('/', authenticateToken, (req, res) => {
  const {
    title,
    description,
    category,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    instructions,
    imageUrl,
    tags
  } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: 'Title, ingredients, and instructions are required.' });
  }

  // Normalize ingredients and instructions
  const parsedIngredients = Array.isArray(ingredients)
    ? ingredients.filter(i => i && (typeof i === 'string' ? i.trim() : i.name))
    : typeof ingredients === 'string'
      ? ingredients.split('\n').map(i => i.trim()).filter(Boolean)
      : [];

  const parsedInstructions = Array.isArray(instructions)
    ? instructions.filter(i => i && i.trim())
    : typeof instructions === 'string'
      ? instructions.split('\n').map(i => i.trim()).filter(Boolean)
      : [];

  const autoApprove = db.data.settings.autoApproveRecipes === true;
  const initialStatus = (autoApprove || req.user.role === 'admin') ? 'approved' : 'pending';

  const defaultImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  ];

  const newRecipe = {
    id: 'rec-' + uuidv4().substr(0, 8),
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category || 'General',
    prepTime: parseInt(prepTime, 10) || 15,
    cookTime: parseInt(cookTime, 10) || 20,
    servings: parseInt(servings, 10) || 4,
    difficulty: difficulty || 'Medium',
    ingredients: parsedIngredients,
    instructions: parsedInstructions,
    tags: Array.isArray(tags) ? tags : [],
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : defaultImages[Math.floor(Math.random() * defaultImages.length)],
    authorId: req.user.id,
    authorName: req.user.name,
    authorAvatar: req.user.avatar,
    status: initialStatus,
    adminFeedback: initialStatus === 'approved' ? 'Auto-approved by platform settings.' : '',
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.data.recipes.unshift(newRecipe);
  db.logActivity('recipe_submitted', req.user, `Shared new recipe: "${newRecipe.title}". Status: ${newRecipe.status}.`);
  db.save();

  // Confirmation message for successful recipe sharing
  const message = initialStatus === 'approved'
    ? 'Recipe published successfully! It is now live for all foodies to discover.'
    : 'Recipe shared successfully! It has been submitted for administrator approval.';

  res.status(201).json({
    message,
    recipe: enrichRecipe(newRecipe)
  });
});

// Edit Recipe (User Dashboard - My Recipes edit)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const recipeIndex = db.data.recipes.findIndex(r => r.id === id);

  if (recipeIndex === -1) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  const recipe = db.data.recipes[recipeIndex];

  // Only author or admin can edit
  if (recipe.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not authorized to edit this recipe.' });
  }

  const {
    title,
    description,
    category,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    instructions,
    imageUrl,
    tags
  } = req.body;

  if (title) recipe.title = title.trim();
  if (description !== undefined) recipe.description = description.trim();
  if (category) recipe.category = category;
  if (prepTime !== undefined) recipe.prepTime = parseInt(prepTime, 10);
  if (cookTime !== undefined) recipe.cookTime = parseInt(cookTime, 10);
  if (servings !== undefined) recipe.servings = parseInt(servings, 10);
  if (difficulty) recipe.difficulty = difficulty;
  if (imageUrl) recipe.imageUrl = imageUrl.trim();

  if (ingredients) {
    recipe.ingredients = Array.isArray(ingredients)
      ? ingredients.filter(i => i && (typeof i === 'string' ? i.trim() : i.name))
      : typeof ingredients === 'string'
        ? ingredients.split('\n').map(i => i.trim()).filter(Boolean)
        : recipe.ingredients;
  }

  if (instructions) {
    recipe.instructions = Array.isArray(instructions)
      ? instructions.filter(i => i && i.trim())
      : typeof instructions === 'string'
        ? instructions.split('\n').map(i => i.trim()).filter(Boolean)
        : recipe.instructions;
  }

  if (tags) {
    recipe.tags = Array.isArray(tags) ? tags : recipe.tags;
  }

  recipe.updatedAt = new Date().toISOString();
  db.save();

  res.json({
    message: 'Recipe updated successfully!',
    recipe: enrichRecipe(recipe)
  });
});

// Delete Recipe (User Dashboard - My Recipes delete)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const recipeIndex = db.data.recipes.findIndex(r => r.id === id);

  if (recipeIndex === -1) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  const recipe = db.data.recipes[recipeIndex];

  // Only author or admin can delete
  if (recipe.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not authorized to delete this recipe.' });
  }

  db.data.recipes.splice(recipeIndex, 1);
  // Also clean up ratings for this recipe
  db.data.ratings = db.data.ratings.filter(r => r.recipeId !== id);

  db.logActivity('recipe_deleted', req.user, `Deleted recipe "${recipe.title}".`);
  db.save();

  res.json({
    message: 'Recipe deleted successfully!'
  });
});

export default router;
