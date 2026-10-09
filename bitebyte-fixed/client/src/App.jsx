import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import BannerNotice from './components/BannerNotice';
import AuthModal from './components/AuthModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import ShareRecipeModal from './components/ShareRecipeModal';
import DiscoverView from './views/DiscoverView';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';
import { Heart, ChefHat, Sparkles, Shield, Coffee } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, isAuthenticated } = useAuth();

  // Navigation views: 'discover' | 'user-dashboard' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState('discover');

  // Modal states
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenEditRecipe = (recipe) => {
    setRecipeToEdit(recipe);
    setIsShareModalOpen(true);
  };

  const handleOpenShareNew = () => {
    setRecipeToEdit(null);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Banner Notice */}
      <BannerNotice />

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenShareModal={handleOpenShareNew}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'discover' && (
          <DiscoverView
            onSelectRecipe={(id) => setSelectedRecipeId(id)}
            onOpenShareModal={handleOpenShareNew}
          />
        )}

        {currentView === 'user-dashboard' && (
          <UserDashboard
            onSelectRecipe={(id) => setSelectedRecipeId(id)}
            onOpenShareModal={handleOpenShareNew}
            onEditRecipe={handleOpenEditRecipe}
          />
        )}

        {currentView === 'admin-dashboard' && (
          isAdmin ? (
            <AdminDashboard onSelectRecipe={(id) => setSelectedRecipeId(id)} />
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
              <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-800">Admin Privileges Required</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                You must be signed in with an Administrator account to access this dashboard.
                Use the top navigation role switcher to toggle into "Admin Mode" with one click.
              </p>
              <button
                onClick={() => setCurrentView('discover')}
                className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Return to Discover
              </button>
            </div>
          )
        )}
      </main>

      {/* Modals */}
      {selectedRecipeId && (
        <RecipeDetailModal
          recipeId={selectedRecipeId}
          onClose={() => setSelectedRecipeId(null)}
          onRefreshList={() => {}}
        />
      )}

      {isShareModalOpen && (
        <ShareRecipeModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setRecipeToEdit(null);
          }}
          recipeToEdit={recipeToEdit}
          onSuccess={() => {}}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">BiteByte</span>
            <span className="text-xs text-slate-400">| BiteByte</span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-right">
            Crafted for culinary enthusiasts • Full-stack Recipe Platform with Admin & User Portals
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
