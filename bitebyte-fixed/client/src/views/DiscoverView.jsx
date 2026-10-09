import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Star,
  Compass,
  Sparkles,
  Utensils,
  X
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Italian',
  'Indian',
  'Mexican',
  'Asian',
  'Dessert',
  'Healthy',
  'Breakfast',
  'American'
];

export default function DiscoverView({ onSelectRecipe, onOpenShareModal }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [maxCookTime, setMaxCookTime] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filtered recipes
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
      if (maxCookTime) params.append('maxCookTime', maxCookTime);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/recipes?${params.toString()}`);
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, difficulty, maxCookTime, minRating, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setDifficulty('All');
    setMaxCookTime('');
    setMinRating('');
    setSort('newest');
  };

  const hasActiveFilters =
    search || category !== 'All' || difficulty !== 'All' || maxCookTime || minRating || sort !== 'newest';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Culinary Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Discover & Share Homemade Flavors</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Discover Exceptional Recipes from Passionate Chefs
          </h1>
          <p className="mt-3 text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
            Browse through authentic community-submitted dishes, step-by-step guides, scaling calculators, and genuine reviews from fellow food lovers.
          </p>

          {/* Large Hero Search Input */}
          <div className="mt-6 flex items-center bg-white rounded-2xl shadow-xl p-1.5 max-w-2xl border border-white/20">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-orange-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by recipe title, cuisine, ingredient (e.g. chicken, garlic, pasta)..."
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => fetchRecipes()}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'All' && <Compass className="w-3.5 h-3.5" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar & Sort Options */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              <span>Filters & Refinements</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-orange-600 ml-1" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-rose-600 underline font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold uppercase">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="top_rated">Highest Rated ★</option>
              <option value="popular">Most Popular (Views)</option>
              <option value="fastest">Fastest Cooking Time</option>
            </select>
          </div>
        </div>

        {/* Collapsible Refinements Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
            {/* Difficulty */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-1 text-xs rounded-lg font-medium border text-center transition-colors ${
                      difficulty === diff
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Cooking Time */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                Max Total Time
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Any', val: '' },
                  { label: '≤ 30m', val: '30' },
                  { label: '≤ 45m', val: '45' },
                  { label: '≤ 60m', val: '60' },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setMaxCookTime(t.val)}
                    className={`py-1 text-xs rounded-lg font-medium border text-center transition-colors ${
                      maxCookTime === t.val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                Minimum Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Any ★', val: '' },
                  { label: '4.0+ ★', val: '4.0' },
                  { label: '4.8+ ★', val: '4.8' },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setMinRating(r.val)}
                    className={`py-1 text-xs rounded-lg font-medium border text-center transition-colors ${
                      minRating === r.val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse"
            >
              <div className="aspect-4/3 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No matching recipes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, clear category filters, or be the first to share this dish with the community!
          </p>
          <div className="mt-5 flex justify-center space-x-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenShareModal}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Share Recipe Now
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Showing {recipes.length} approved culinary recipe{recipes.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(r) => onSelectRecipe(r.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
