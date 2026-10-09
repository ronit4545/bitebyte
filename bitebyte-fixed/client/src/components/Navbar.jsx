import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  UtensilsCrossed,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onOpenShareModal, onOpenAuthModal }) {
  const { user, isAdmin, isAuthenticated, demoLogin, logout } = useAuth();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleToggle = async () => {
    const targetRole = isAdmin ? 'user' : 'admin';
    try {
      const res = await demoLogin(targetRole);
      toast.info(`Switched role to: ${targetRole.toUpperCase()} (${res.user.name})`);
      if (targetRole === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('user-dashboard');
      }
    } catch {
      toast.error('Could not switch demo role.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setCurrentView('discover')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                Bite<span className="text-orange-600">Byte</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                BiteByte
              </span>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('discover')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'discover'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setCurrentView('user-dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'user-dashboard'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>User Dashboard</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'admin-dashboard'
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-purple-700 hover:bg-purple-50/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin Dashboard</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Quick Role Switcher + Share Recipe Button + User Menu */}
        <div className="flex items-center space-x-3">
          {/* Quick Evaluator Role Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium px-2">Role:</span>
            <button
              onClick={handleRoleToggle}
              title="Click to instantly toggle between Admin and User"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-orange-500 text-white shadow-xs'
              }`}
            >
              <RefreshCw className="w-3 h-3 animate-spin-reverse" />
              <span>{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
              <span className="text-[10px] opacity-80 underline ml-1">Switch</span>
            </button>
          </div>

          {/* Share Recipe CTA */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuthModal();
              } else {
                onOpenShareModal();
              }
            }}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Share Recipe</span>
            <span className="sm:hidden">Share</span>
          </button>

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-200"
                />
                <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[110px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('user-dashboard');
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-400" />
                    User Dashboard
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentView('admin-dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2.5 text-purple-500" />
                      Admin Dashboard
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      toast.info('Signed out successfully.');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 text-sm font-semibold text-slate-700 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
