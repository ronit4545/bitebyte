import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 3. Rate and Comment:
// Input: Rating and comment details
// Output: Confirmation message for successful submission
// Functionality: Rate and comment on recipes.
router.post('/', authenticateToken, (req, res) => {
  const { recipeId, rating, comment } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: 'Recipe ID is required.' });
  }

  const recipe = db.data.recipes.find(r => r.id === recipeId);
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5 stars.' });
  }

  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: 'Please share your comment or review feedback.' });
  }

  // Check if user already reviewed this recipe; if so, update existing review or allow multiple
  const existingReviewIndex = db.data.ratings.findIndex(
    r => r.recipeId === recipeId && r.userId === req.user.id
  );

  let resultReview;

  if (existingReviewIndex !== -1) {
    // Update existing review
    const existing = db.data.ratings[existingReviewIndex];
    existing.rating = ratingNum;
    existing.comment = comment.trim();
    existing.createdAt = new Date().toISOString();
    resultReview = existing;
    db.logActivity('recipe_reviewed', req.user, `Updated review (${ratingNum} stars) on "${recipe.title}".`);
  } else {
    // Create new review
    resultReview = {
      id: 'rat-' + uuidv4().substr(0, 8),
      recipeId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating: ratingNum,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };
    db.data.ratings.unshift(resultReview);
    db.logActivity('recipe_reviewed', req.user, `Rated ${ratingNum} stars & commented on "${recipe.title}".`);
  }

  db.save();

  // Confirmation message for successful submission
  res.status(201).json({
    message: 'Thank you! Your rating and comment have been submitted successfully.',
    review: resultReview
  });
});

// User Dashboard: 3. Ratings and Comments:
// Section for viewing and managing ratings and comments made on recipes.
router.get('/my-ratings', authenticateToken, (req, res) => {
  const userRatings = db.data.ratings
    .filter(r => r.userId === req.user.id)
    .map(rat => {
      const recipe = db.data.recipes.find(rec => rec.id === rat.recipeId);
      return {
        ...rat,
        recipeTitle: recipe ? recipe.title : 'Recipe No Longer Available',
        recipeImage: recipe ? recipe.imageUrl : '',
        recipeCategory: recipe ? recipe.category : 'General'
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userRatings);
});

// Delete comment (User managing their review, or Admin moderation)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const ratingIndex = db.data.ratings.findIndex(r => r.id === id);

  if (ratingIndex === -1) {
    return res.status(404).json({ message: 'Rating/comment not found.' });
  }

  const rating = db.data.ratings[ratingIndex];

  // Only author or admin can delete
  if (rating.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
  }

  db.data.ratings.splice(ratingIndex, 1);
  db.save();

  res.json({
    message: 'Rating and comment deleted successfully!'
  });
});

export default router;
