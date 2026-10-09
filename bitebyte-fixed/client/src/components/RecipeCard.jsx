import React from 'react';
import { Clock, Star, Users, Flame, Eye, Edit3, Trash2 } from 'lucide-react';

export default function RecipeCard({
  recipe,
  onSelect,
  isAuthorView = false,
  onEdit,
  onDelete
}) {
  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusColors = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    rejected: 'bg-rose-100 text-rose-800 border-rose-300'
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div
      onClick={() => onSelect && onSelect(recipe)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Recipe Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
            {recipe.category || 'Culinary'}
          </span>

          {isAuthorView && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-xs ${
                statusColors[recipe.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {recipe.status}
            </span>
          )}

          {!isAuthorView && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md bg-white/90 ${
                difficultyColors[recipe.difficulty] || 'bg-slate-50 text-slate-700'
              }`}
            >
              {recipe.difficulty || 'Medium'}
            </span>
          )}
        </div>

        {/* Bottom Time & Servings overlays */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium drop-shadow-sm">
          <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{totalTime} mins</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.servings} serv</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center space-x-2 truncate">
            <img
              src={recipe.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={recipe.authorName}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
              {recipe.authorName}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{recipe.averageRating > 0 ? recipe.averageRating : 'New'}</span>
            {recipe.reviewCount > 0 && (
              <span className="text-slate-400 text-[10px] font-normal">
                ({recipe.reviewCount})
              </span>
            )}
          </div>
        </div>

        {/* Author Actions (Edit & Delete) */}
        {isAuthorView && (
          <div
            className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit && onEdit(recipe)}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-orange-600 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete && onDelete(recipe)}
              className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
