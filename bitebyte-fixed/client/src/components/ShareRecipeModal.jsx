import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Plus,
  Trash2,
  Image,
  Utensils,
  Clock,
  Users,
  Tag,
  Check,
  Sparkles,
  ChefHat
} from 'lucide-react';

const PRESET_PHOTOS = [
  { name: 'Italian Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800' },
  { name: 'Indian Curry', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800' },
  { name: 'Mexican Tacos', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800' },
  { name: 'Asian Wok Noodles', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800' },
  { name: 'Dessert Cake', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800' },
  { name: 'Healthy Bowl', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800' },
  { name: 'Breakfast Stack', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800' }
];

const AVAILABLE_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein', 'Low-Carb', 'Quick & Easy', 'Dinner Party'
];

export default function ShareRecipeModal({ isOpen, onClose, recipeToEdit = null, onSuccess }) {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Italian');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipeToEdit) {
      setTitle(recipeToEdit.title || '');
      setDescription(recipeToEdit.description || '');
      setCategory(recipeToEdit.category || 'Italian');
      setDifficulty(recipeToEdit.difficulty || 'Medium');
      setPrepTime(recipeToEdit.prepTime || 15);
      setCookTime(recipeToEdit.cookTime || 25);
      setServings(recipeToEdit.servings || 4);
      setImageUrl(recipeToEdit.imageUrl || '');
      setIngredientsText(
        Array.isArray(recipeToEdit.ingredients)
          ? recipeToEdit.ingredients.map(i => typeof i === 'string' ? i : i.name).join('\n')
          : ''
      );
      setInstructionsText(
        Array.isArray(recipeToEdit.instructions)
          ? recipeToEdit.instructions.join('\n')
          : ''
      );
      setSelectedTags(recipeToEdit.tags || []);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Italian');
      setDifficulty('Medium');
      setPrepTime(15);
      setCookTime(25);
      setServings(4);
      setImageUrl(PRESET_PHOTOS[0].url);
      setIngredientsText('400g Fresh produce / main protein\n2 tbsp Olive oil or butter\n3 cloves Garlic, minced\nSalt and black pepper to taste');
      setInstructionsText('Prepare all ingredients and preheat cookware.\nSauté aromatics until fragrant.\nCook main elements to perfection.\nSeason to taste, garnish, and serve hot!');
      setSelectedTags(['Quick & Easy']);
    }
  }, [recipeToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 1. Recipe Sharing:
  // Input: Recipe details (title, ingredients, instructions, photos)
  // Output: Confirmation message for successful recipe sharing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to share a recipe.');
      return;
    }

    if (!title.trim()) {
      toast.error('Recipe title is required.');
      return;
    }

    const ingredients = ingredientsText
      .split('\n')
      .map(i => i.trim())
      .filter(Boolean);

    const instructions = instructionsText
      .split('\n')
      .map(i => i.trim())
      .filter(Boolean);

    if (ingredients.length === 0 || instructions.length === 0) {
      toast.error('Please provide at least one ingredient and one cooking instruction.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        difficulty,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        imageUrl: imageUrl || PRESET_PHOTOS[0].url,
        ingredients,
        instructions,
        tags: selectedTags
      };

      const url = recipeToEdit ? `/api/recipes/${recipeToEdit.id}` : '/api/recipes';
      const method = recipeToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      // Confirmation message for successful recipe sharing
      toast.success(data.message);

      if (onSuccess) onSuccess(data.recipe);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {recipeToEdit ? 'Edit Your Culinary Recipe' : 'Share a New Recipe'}
              </h2>
              <p className="text-orange-100 text-xs">
                {recipeToEdit
                  ? 'Update ingredients, measurements, or preparation steps'
                  : 'Inspire home cooks and food lovers worldwide with your culinary masterpiece'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Creamy Tuscan Garlic Chicken Linguine"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Cuisine / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Italian">Italian</option>
                <option value="Indian">Indian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="Dessert">Dessert</option>
                <option value="Healthy">Healthy</option>
                <option value="Breakfast">Breakfast</option>
                <option value="American">American</option>
                <option value="Mediterranean">Mediterranean</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Short Description & Story
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this dish memorable? Describe its aroma, texture, and origin..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Quick Metrics: Prep, Cook, Servings, Difficulty */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Prep (mins)
              </label>
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Cook (mins)
              </label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Photo URL & Quick Gallery Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Recipe Cover Photo URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Sample photos:</span>
              {PRESET_PHOTOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients Textarea (one per line) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ingredients List * (One per line)
              </label>
              <span className="text-[11px] text-slate-400">e.g. 400g Chicken breast</span>
            </div>
            <textarea
              rows={4}
              required
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="400g Chicken breast&#10;250g Linguine pasta&#10;1 cup Heavy cream&#10;4 cloves Garlic, minced"
              className="w-full p-3 font-mono text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
            />
          </div>

          {/* Instructions Textarea (one step per line) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cooking Instructions * (One step per line)
              </label>
              <span className="text-[11px] text-slate-400">Steps are numbered automatically</span>
            </div>
            <textarea
              rows={4}
              required
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="Season chicken breast with salt and pepper.&#10;Sear in olive oil for 5-6 mins per side until golden.&#10;Make garlic parmesan cream sauce in the same skillet.&#10;Toss with boiled pasta and serve warm!"
              className="w-full p-3 font-mono text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Dietary & Cuisine Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-0.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{loading ? 'Submitting...' : recipeToEdit ? 'Save Changes' : 'Publish Recipe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
