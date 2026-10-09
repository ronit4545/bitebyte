import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Clock,
  Users,
  Flame,
  Star,
  CheckCircle,
  MessageSquare,
  Send,
  Trash2,
  ChefHat,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Minus,
  Plus
} from 'lucide-react';

export default function RecipeDetailModal({ recipeId, onClose, onRefreshList }) {
  const { user, token, isAuthenticated } = useAuth();
  const toast = useToast();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive Servings Scaler state
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedSteps, setCheckedSteps] = useState({});

  // Rate and Comment Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch recipe details
  const fetchRecipe = async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error('Recipe not found');
      const data = await res.json();
      setRecipe(data.recipe);
      setReviews(data.reviews || []);
      setServings(data.recipe.servings || 4);
    } catch (err) {
      toast.error('Could not load recipe details.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  if (!recipeId) return null;

  // Scale ingredient quantities dynamically
  const scaleRatio = recipe ? servings / (recipe.servings || 4) : 1;

  const formatScaledIngredient = (ing) => {
    if (typeof ing !== 'string') return ing?.name || '';
    // Look for leading numbers or fractions e.g. "400g", "2 cups", "1/2 cup", "1.5 tbsp"
    const match = ing.match(/^([\d./]+)\s*(.*)$/);
    if (!match) return ing;

    let numStr = match[1];
    let rest = match[2];

    let val = 0;
    if (numStr.includes('/')) {
      const parts = numStr.split('/');
      val = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      val = parseFloat(numStr);
    }

    if (isNaN(val)) return ing;

    const scaled = (val * scaleRatio).toFixed(1).replace(/\.0$/, '');
    return `${scaled} ${rest}`;
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Submit Rating & Comment:
  // Input: Rating and comment details
  // Output: Confirmation message for successful submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to rate and comment on recipes.');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      // Confirmation message for successful submission
      toast.success(data.message);
      setComment('');
      // Refresh recipe and reviews
      fetchRecipe();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      toast.error(err.message || 'Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/ratings/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || 'Review removed.');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      fetchRecipe();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      toast.error(err.message || 'Could not delete review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative max-h-[92vh]">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 hover:bg-white shadow-lg flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !recipe ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">Preparing recipe view...</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {/* Hero Image Section */}
            <div className="relative aspect-16/9 sm:aspect-21/9 bg-slate-900 overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {recipe.category}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {recipe.difficulty}
                  </span>
                  <span className="bg-black/30 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-full">
                    {recipe.views || 0} views
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                  {recipe.title}
                </h1>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Author & Metrics Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Author Info */}
                <div className="flex items-center space-x-3.5">
                  <img
                    src={recipe.authorAvatar}
                    alt={recipe.authorName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-300"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-orange-600 uppercase">Shared by</span>
                      <ChefHat className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{recipe.authorName}</h4>
                    <p className="text-xs text-slate-400">
                      Published {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Recipe Metrics Overview */}
                <div className="flex items-center space-x-6 text-slate-700">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block font-medium">Prep Time</span>
                    <span className="text-sm font-bold text-slate-800">{recipe.prepTime}m</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block font-medium">Cook Time</span>
                    <span className="text-sm font-bold text-slate-800">{recipe.cookTime}m</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block font-medium">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="text-sm font-bold text-slate-800">
                        {recipe.averageRating > 0 ? recipe.averageRating : 'New'}
                      </span>
                      <span className="text-xs text-slate-400">({recipe.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Description & Tags */}
              <div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {recipe.description}
                </p>
                {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {recipe.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-lg border border-orange-100"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Servings Scaler Header */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Serving Size Calculator</span>
                  </h3>
                  <p className="text-xs text-amber-800">
                    Adjust portions to automatically recalculate required ingredient quantities.
                  </p>
                </div>
                <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="p-1 rounded-md text-amber-800 hover:bg-amber-50 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-800 min-w-[20px] text-center">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="p-1 rounded-md text-amber-800 hover:bg-amber-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Two Column Grid: Ingredients & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Ingredients Column */}
                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-lg">Ingredients</h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {recipe.ingredients?.length || 0} items
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {recipe.ingredients?.map((ing, idx) => (
                      <li
                        key={idx}
                        onClick={() => toggleIngredient(idx)}
                        className={`flex items-start space-x-3 p-2.5 rounded-xl transition-all cursor-pointer border ${
                          checkedIngredients[idx]
                            ? 'bg-slate-50 text-slate-400 line-through border-slate-200'
                            : 'bg-white text-slate-700 hover:bg-orange-50/50 border-slate-100'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                            checkedIngredients[idx]
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checkedIngredients[idx] && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          {formatScaledIngredient(ing)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions Column */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-lg">Step-by-Step Instructions</h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {recipe.instructions?.length || 0} steps
                    </span>
                  </div>

                  <ol className="space-y-4">
                    {recipe.instructions?.map((step, idx) => (
                      <li
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          checkedSteps[idx]
                            ? 'bg-slate-50/80 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200/80 hover:border-orange-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                              checkedSteps[idx]
                                ? 'bg-emerald-500 text-white'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              checkedSteps[idx]
                                ? 'line-through text-slate-400'
                                : 'text-slate-700'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* 3. Rate and Comment Section */}
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                      <span>Ratings & Reviews</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Share your culinary feedback with the community
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-bold text-amber-900 text-sm">
                      {recipe.averageRating > 0 ? recipe.averageRating : '0'} / 5.0
                    </span>
                    <span className="text-xs text-amber-700">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Submit New Rating Form */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Rate this recipe:
                    </span>
                    {/* 5-Star Selector */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              (hoverRating || rating) >= star
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">
                        {rating} Star{rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Did you try making this recipe? Share your taste verdict, modifications, or tips..."
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </div>
                </form>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs text-slate-500 font-medium">
                        No reviews yet. Be the first chef to taste and review this recipe!
                      </p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between space-x-4"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={rev.userName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-800">
                                {rev.userName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-0.5 my-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    rev.rating >= s
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">
                              {rev.comment}
                            </p>
                          </div>
                        </div>

                        {/* Delete Review option if current user is the author or admin */}
                        {(user?.id === rev.userId || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Delete comment"
                            className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
