import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Compass,
  MessageSquare,
  UserCheck,
  History,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  Mail,
  User,
  ChefHat,
  Sparkles
} from 'lucide-react';

export default function UserDashboard({
  onSelectRecipe,
  onOpenShareModal,
  onEditRecipe,
  defaultTab = 'my-recipes'
}) {
  const { user, token, updateProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [myRecipes, setMyRecipes] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileSpecialty, setProfileSpecialty] = useState(user?.specialty || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Fetch user's data
  const fetchUserData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. My Recipes
      const recRes = await fetch('/api/recipes/my-recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (recRes.ok) {
        const data = await recRes.json();
        setMyRecipes(data);
      }

      // 3. Ratings and Comments
      const ratRes = await fetch('/api/ratings/my-ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ratRes.ok) {
        const data = await ratRes.json();
        setMyRatings(data);
      }

      // 5. Recipe Sharing History
      const histRes = await fetch('/api/recipes/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (histRes.ok) {
        const data = await histRes.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileBio(user.bio || '');
      setProfileSpecialty(user.specialty || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  // Delete recipe
  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) return;
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Confirmation message for successful recipe deletion
      toast.success(data.message || 'Recipe deleted successfully!');
      fetchUserData();
    } catch (err) {
      toast.error(err.message || 'Could not delete recipe.');
    }
  };

  // Delete user's comment
  const handleDeleteComment = async (ratingId) => {
    if (!window.confirm('Delete this rating and comment?')) return;
    try {
      const res = await fetch(`/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || 'Comment removed.');
      setMyRatings(prev => prev.filter(r => r.id !== ratingId));
    } catch (err) {
      toast.error(err.message || 'Could not delete comment.');
    }
  };

  // 4. Profile Management:
  // Input: Profile details (name, email, password)
  // Output: Confirmation message for successful profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({
        name: profileName,
        bio: profileBio,
        specialty: profileSpecialty,
        avatar: profileAvatar
      });
      // Output: Confirmation message for successful profile update
      toast.success(res.message || 'Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  // Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter both current and new password.');
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* User Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-orange-100 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-xs text-orange-700 font-semibold mt-1">
              Culinary Specialty: <span className="text-slate-700">{user?.specialty || 'Food Enthusiast'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenShareModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-md shadow-orange-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share New Recipe</span>
        </button>
      </div>

      {/* User Dashboard 5 Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 scrollbar-none">
        {[
          { id: 'my-recipes', label: '1. My Recipes', icon: BookOpen, count: myRecipes.length },
          { id: 'ratings-comments', label: '2. Ratings & Comments', icon: MessageSquare, count: myRatings.length },
          { id: 'history', label: '3. Recipe Sharing History', icon: History, count: historyList.length },
          { id: 'profile', label: '4. Profile Management', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-orange-200 text-orange-900' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY RECIPES */}
      {activeTab === 'my-recipes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Personal Recipes Management
            </h2>
            <span className="text-xs text-slate-500">
              {myRecipes.length} recipes created
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading your recipes...</div>
          ) : myRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">No personal recipes shared yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Share your first dish with ingredients, instructions, and appetizing photos!
              </p>
              <button
                onClick={onOpenShareModal}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold"
              >
                Share Recipe
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Recipe</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Rating & Views</th>
                      <th className="px-6 py-3.5">Created</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRecipes.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={r.imageUrl}
                              alt={r.title}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div>
                              <button
                                onClick={() => onSelectRecipe(r.id)}
                                className="font-bold text-slate-900 hover:text-orange-600 text-left line-clamp-1"
                              >
                                {r.title}
                              </button>
                              <span className="text-xs text-slate-400">
                                {r.servings} servings • {r.prepTime + r.cookTime} mins
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                            r.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <span>{r.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                              <span>{r.averageRating > 0 ? r.averageRating : '-'}</span>
                            </div>
                            <span className="text-slate-400">({r.views || 0} views)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onSelectRecipe(r.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                              title="View"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditRecipe(r)}
                              className="p-1.5 text-orange-600 hover:text-orange-700 rounded-lg hover:bg-orange-50"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(r.id, r.title)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RATINGS AND COMMENTS */}
      {activeTab === 'ratings-comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Ratings and Comments Made on Recipes
            </h2>
            <span className="text-xs text-slate-500">
              {myRatings.length} reviews submitted
            </span>
          </div>

          {myRatings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">No ratings or comments yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore recipes in the Discover section, try them out, and share your culinary feedback!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRatings.map((rat) => (
                <div
                  key={rat.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => onSelectRecipe(rat.recipeId)}
                        className="font-bold text-slate-900 text-sm hover:text-orange-600 line-clamp-1 text-left"
                      >
                        {rat.recipeTitle}
                      </button>
                      <button
                        onClick={() => handleDeleteComment(rat.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-md"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            rat.rating >= s
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {rat.rating} Star{rat.rating > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                      "{rat.comment}"
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Reviewed on {new Date(rat.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onSelectRecipe(rat.recipeId)}
                      className="text-orange-600 hover:underline font-semibold"
                    >
                      View Recipe →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECIPE SHARING HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Recipe Sharing History & Statuses
            </h2>
            <span className="text-xs text-slate-500">
              Chronological log of submissions
            </span>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">No submission history found</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400">
                        Category: {item.category} • Submitted on {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                      {item.adminFeedback && (
                        <p className="text-xs mt-1 text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <strong className="text-amber-800">Admin Feedback:</strong> {item.adminFeedback}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                      item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                    <button
                      onClick={() => onSelectRecipe(item.id)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-6 pb-4 border-b border-slate-100">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Personal Profile Details</h3>
                <p className="text-xs text-slate-400">Manage your publicly displayed culinary persona</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Culinary Specialty / Bio Tag
                </label>
                <input
                  type="text"
                  value={profileSpecialty}
                  onChange={(e) => setProfileSpecialty(e.target.value)}
                  placeholder="e.g. Modern Italian, Sourdough Artisan, Street Food"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Avatar Photo URL
                </label>
                <input
                  type="url"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Culinary Bio / Story
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Share a short intro about your passion for cooking and sharing recipes..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Update Profile Details
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs h-fit">
            <div className="flex items-center space-x-2.5 mb-6 pb-4 border-b border-slate-100">
              <Lock className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Security & Password</h3>
                <p className="text-xs text-slate-400">Update your account login password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password * (Min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
