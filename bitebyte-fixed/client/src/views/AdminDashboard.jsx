import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  UtensilsCrossed,
  Sliders,
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Save,
  Search,
  Filter,
  Check,
  Clock,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Shield,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';

export default function AdminDashboard({ onSelectRecipe }) {
  const { user, token } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('users');

  // 1. User Management State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'user', password: '' });

  // 2. Recipe Management State
  const [recipesList, setRecipesList] = useState([]);
  const [recipeStatusFilter, setRecipeStatusFilter] = useState('pending');
  const [rejectModalRecipe, setRejectModalRecipe] = useState(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // 3. System Settings State
  const [settings, setSettings] = useState({
    platformName: '',
    tagline: '',
    allowRegistration: true,
    autoApproveRecipes: false,
    maxUploadSizeMB: 5,
    maintenanceMode: false,
    contactEmail: '',
    bannerNotice: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // 4. Statistics State
  const [stats, setStats] = useState(null);

  // 5. Activity Logs State
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [sseConnected, setSseConnected] = useState(false);

  // Load All Admin Data
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/admin/recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipesList(data);
      }
    } catch (err) {
      console.error('Error fetching admin recipes:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch('/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/admin/activity?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchRecipes();
    fetchSettings();
    fetchStatistics();
    fetchActivity();

    // 5. User Activity Monitoring: Real-time updates via EventSource
    let eventSource;
    try {
      eventSource = new EventSource('/api/admin/activity/stream');
      eventSource.onopen = () => setSseConnected(true);
      eventSource.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data);
          if (log.id) {
            setActivityLogs((prev) => [log, ...prev.filter(l => l.id !== log.id)]);
            fetchStatistics();
            fetchRecipes();
          }
        } catch {
          // ignore non-json
        }
      };
      eventSource.onerror = () => setSseConnected(false);
    } catch {
      setSseConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [token]);

  // -------------------------------------------------------------
  // 1. USER MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  // Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');

      // Output: Confirmation message for successful user creation
      toast.success(data.message);
      setShowAddUserModal(false);
      setNewUserData({ name: '', email: '', role: 'user', password: '' });
      fetchUsers();
      fetchStatistics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');

      // Output: Confirmation message for successful user update
      toast.success(data.message);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');

      // Output: Confirmation message for successful user deletion
      toast.success(data.message);
      fetchUsers();
      fetchStatistics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // -------------------------------------------------------------
  // 2. RECIPE MANAGEMENT (Approve / Reject) HANDLERS
  // -------------------------------------------------------------
  const handleApproveRecipe = async (recipe) => {
    try {
      const res = await fetch(`/api/admin/recipes/${recipe.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          adminFeedback: 'Approved for community publishing.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Output: Recipe approval status
      toast.success(data.message);
      fetchRecipes();
      fetchStatistics();
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleOpenRejectModal = (recipe) => {
    setRejectModalRecipe(recipe);
    setRejectFeedback('Please provide more detailed measurements or higher resolution cooking photos.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRecipe) return;
    try {
      const res = await fetch(`/api/admin/recipes/${rejectModalRecipe.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          adminFeedback: rejectFeedback
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Output: Recipe approval status
      toast.success(data.message);
      setRejectModalRecipe(null);
      fetchRecipes();
      fetchStatistics();
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
  };

  // -------------------------------------------------------------
  // 3. SYSTEM SETTINGS HANDLERS
  // -------------------------------------------------------------
  // Output: Confirmation message for successful settings update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save settings');

      // Output: Confirmation message for successful settings update
      toast.success(data.message);
      setSettings(data.settings);
    } catch (err) {
      toast.error(err.message || 'Failed to update configurations');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Filtered Recipes
  const filteredRecipes = recipesList.filter((r) => {
    if (recipeStatusFilter === 'all') return true;
    return r.status === recipeStatusFilter;
  });

  const pendingCount = recipesList.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-purple-200 mb-2 border border-purple-400/30">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Content Oversight
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
            Oversee user accounts, manage and approve recipe submissions, configure platform settings, monitor real-time activities, and analyze culinary metrics.
          </p>
        </div>

        {/* Real-Time SSE Indicator */}
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${sseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-200">
            {sseConnected ? 'Live Real-Time Activity' : 'Activity Polling'}
          </span>
        </div>
      </div>

      {/* Admin Dashboard 5 Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 scrollbar-none">
        {[
          { id: 'users', label: '1. User Management', icon: Users, count: usersList.length },
          { id: 'recipes', label: '2. Recipe Management', icon: UtensilsCrossed, badge: pendingCount > 0 ? pendingCount : null },
          { id: 'settings', label: '3. System Settings', icon: Sliders },
          { id: 'statistics', label: '4. Recipe Statistics', icon: BarChart3 },
          { id: 'activity', label: '5. User Activity Monitoring', icon: Activity, count: activityLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-purple-600 text-purple-700 bg-purple-50/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full animate-bounce">
                  {tab.badge} pending
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: USER MANAGEMENT                                       */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                {['all', 'admin', 'user'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors ${
                      userRoleFilter === r
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Add User Button */}
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          {/* User Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Activity Stats</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span>{u.recipesCount || 0} recipes</span> •{' '}
                        <span>{u.ratingsCount || 0} reviews</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Create User Account</h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                      placeholder="Chef Name"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="user@bitebyte.com"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="user">User (Standard Contributor)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                    <input
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      placeholder="Default: BiteByte123!"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Edit User Account</h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="user">User (Standard Contributor)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended (Access Revoked)</option>
                    </select>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: RECIPE MANAGEMENT (Approval / Rejection Workflow)     */}
      {/* ============================================================ */}
      {activeTab === 'recipes' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: 'all', label: 'All Recipes', count: recipesList.length },
              { id: 'pending', label: 'Pending Approval', count: pendingCount, highlight: true },
              { id: 'approved', label: 'Approved & Live', count: recipesList.filter(r => r.status === 'approved').length },
              { id: 'rejected', label: 'Rejected', count: recipesList.filter(r => r.status === 'rejected').length },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setRecipeStatusFilter(st.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  recipeStatusFilter === st.id
                    ? st.highlight
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  recipeStatusFilter === st.id ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Recipes Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Recipe Details</th>
                    <th className="px-6 py-3.5">Author</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Submitted</th>
                    <th className="px-6 py-3.5 text-right">Approve / Reject Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                        No recipes found matching "{recipeStatusFilter}" filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecipes.map((r) => (
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
                                className="font-bold text-slate-900 text-xs sm:text-sm hover:text-purple-700 text-left line-clamp-1"
                              >
                                {r.title}
                              </button>
                              <span className="text-xs text-slate-400">
                                {r.ingredients?.length || 0} ingredients • {r.instructions?.length || 0} steps
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <img
                              src={r.authorAvatar}
                              alt={r.authorName}
                              className="w-6 h-6 rounded-full object-cover border"
                            />
                            <span className="text-xs font-medium text-slate-700">{r.authorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                              r.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : r.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <span>{r.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onSelectRecipe(r.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                              title="Preview Recipe"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {r.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveRecipe(r)}
                                className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                                title="Approve Recipe"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {r.status !== 'rejected' && (
                              <button
                                onClick={() => handleOpenRejectModal(r)}
                                className="flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                                title="Reject Recipe"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejection Feedback Modal */}
          {rejectModalRecipe && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Reject Recipe Submission</h3>
                  <button onClick={() => setRejectModalRecipe(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Provide constructive feedback to author <strong className="text-slate-800">{rejectModalRecipe.authorName}</strong> explaining why "{rejectModalRecipe.title}" was rejected.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Reason / Required Changes *
                    </label>
                    <textarea
                      rows={4}
                      value={rejectFeedback}
                      onChange={(e) => setRejectFeedback(e.target.value)}
                      placeholder="Describe what needs improvement before resubmission..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setRejectModalRecipe(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SYSTEM SETTINGS                                       */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="font-bold text-slate-900 text-lg">System-Wide Configurations</h2>
                <p className="text-xs text-slate-500">Manage platform operational behavior, moderation rules, and banners</p>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contact / Support Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Max Upload Photo Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxUploadSizeMB}
                  onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {/* Recipe Auto Approval */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto-Approve Recipes</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    If disabled, recipes require administrator approval before going public.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoApproveRecipes}
                  onChange={(e) => setSettings({ ...settings, autoApproveRecipes: e.target.checked })}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer mt-1"
                />
              </div>

              {/* Allow Registration */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Allow Registrations</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Permit public users to register new accounts freely.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer mt-1"
                />
              </div>

              {/* Maintenance Mode */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Maintenance Mode</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Temporarily restrict user recipe submissions for maintenance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* Banner Notice */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Global Header Announcement Banner Notice
              </label>
              <textarea
                rows={2}
                value={settings.bannerNotice}
                onChange={(e) => setSettings({ ...settings, bannerNotice: e.target.value })}
                placeholder="Alert text displayed at the very top of all pages..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: RECIPE STATISTICS                                     */}
      {/* ============================================================ */}
      {activeTab === 'statistics' && stats && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Recipes</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.metrics.totalRecipes}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600 block">Approved</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.metrics.approvedRecipes}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-amber-600 block">Pending Review</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.metrics.pendingRecipes}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Chefs</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.metrics.totalUsers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Reviews Given</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.metrics.totalComments}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-amber-500 block">Platform Avg Rating</span>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-2xl font-black text-slate-900">{stats.metrics.avgRating}</span>
                <span className="text-xs text-amber-500 font-bold">★</span>
              </div>
            </div>
          </div>

          {/* Graphical Visualizations (Submission Trends & Category Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Recipe Submission Trends Visual Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Recipe Submissions & Community Growth</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly trajectory of recipe creations and reviews</p>
              </div>

              {/* Responsive Bar Chart Visualization */}
              <div className="mt-6 flex items-end justify-between h-48 pt-6 pb-2 px-2 border-b border-slate-100">
                {stats.submissionTrend?.map((item, idx) => {
                  const maxVal = Math.max(...stats.submissionTrend.map(t => t.submissions + t.comments), 8);
                  const subHeight = (item.submissions / maxVal) * 100;
                  const comHeight = (item.comments / maxVal) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 space-y-2 group">
                      <div className="flex items-end space-x-1 h-36">
                        {/* Submissions Bar */}
                        <div
                          style={{ height: `${Math.max(subHeight, 10)}%` }}
                          className="w-3 sm:w-5 bg-purple-600 rounded-t-md group-hover:bg-purple-700 transition-all relative"
                          title={`${item.month}: ${item.submissions} submissions`}
                        />
                        {/* Comments Bar */}
                        <div
                          style={{ height: `${Math.max(comHeight, 8)}%` }}
                          className="w-3 sm:w-5 bg-amber-400 rounded-t-md group-hover:bg-amber-500 transition-all relative"
                          title={`${item.month}: ${item.comments} reviews`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium rotate-[-25deg] sm:rotate-0">
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-purple-600 rounded-xs" />
                  <span>Recipe Submissions</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-amber-400 rounded-xs" />
                  <span>Ratings & Comments</span>
                </div>
              </div>
            </div>

            {/* 2. Category Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <UtensilsCrossed className="w-4 h-4 text-purple-600" />
                  <span>Recipe Distribution by Cuisine / Category</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Breakdown of content library diversity</p>
              </div>

              <div className="mt-6 space-y-3">
                {stats.categoryBreakdown?.map((cat) => {
                  const pct = Math.round((cat.count / stats.metrics.totalRecipes) * 100);
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{cat.category}</span>
                        <span className="text-slate-500">{cat.count} recipes ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
                Balanced across global cuisines and regional specialities
              </div>
            </div>
          </div>

          {/* Tables: Top Rated Recipes & Top Contributors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Highest Rated Recipes */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
                <span>Top Rated Culinary Recipes</span>
                <span className="text-xs text-amber-600 font-semibold">Leaderboard</span>
              </h3>
              <div className="space-y-3">
                {stats.topRatedRecipes?.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <button
                          onClick={() => onSelectRecipe(r.id)}
                          className="font-bold text-xs sm:text-sm text-slate-800 hover:text-purple-700 text-left line-clamp-1"
                        >
                          {r.title}
                        </button>
                        <span className="text-[11px] text-slate-400">By {r.authorName} • {r.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-800">
                      <span>★</span>
                      <span>{r.averageRating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({r.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recipe Contributors */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
                <span>Most Active Chef Contributors</span>
                <span className="text-xs text-purple-600 font-semibold">Hall of Fame</span>
              </h3>
              <div className="space-y-3">
                {stats.topContributors?.map((c, idx) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-800">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.recipesCount} submitted ({c.approvedCount} approved)</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-purple-100 text-purple-700">
                      Active Chef
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: USER ACTIVITY MONITORING (Real-Time Live Updates)     */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-slate-900 text-lg">Real-Time User Activity Monitoring</h2>
                <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live Stream Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant audit log of registrations, submissions, reviews, ratings, and administrative actions
              </p>
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'user_registered', label: 'Signups' },
                { id: 'recipe_submitted', label: 'Submissions' },
                { id: 'recipe_approved', label: 'Approvals' },
                { id: 'recipe_reviewed', label: 'Reviews' },
                { id: 'settings_updated', label: 'Settings' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activityFilter === f.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3">
            {activityLogs
              .filter((log) => activityFilter === 'all' || log.type === activityFilter)
              .map((log) => {
                const typeColors = {
                  user_registered: 'bg-blue-100 text-blue-800 border-blue-200',
                  recipe_submitted: 'bg-orange-100 text-orange-800 border-orange-200',
                  recipe_approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  recipe_rejected: 'bg-rose-100 text-rose-800 border-rose-200',
                  recipe_reviewed: 'bg-amber-100 text-amber-800 border-amber-200',
                  settings_updated: 'bg-purple-100 text-purple-800 border-purple-200',
                };

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-start justify-between space-x-4 transition-colors"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {log.actorName ? log.actorName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {log.actorName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            typeColors[log.type] || 'bg-slate-100 text-slate-700'
                          }`}>
                            {log.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {log.details}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
