import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/home";
import { Dashboard } from '../components/Dashboard';
import { StatsView } from '../components/StatsView';
import { ProfileView } from '../components/ProfileView';
import { PetsView } from '../components/PetsView';
import { BooksView } from '../components/BooksView';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../lib/auth-context';
import { Home, BarChart3, User, Dog, BookOpen } from 'lucide-react';

type View = 'dashboard' | 'stats' | 'pets' | 'books' | 'profile';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trainer Log - Dog Training Certification Tracker" },
    { name: "description", content: "Track your journey to CPDT-KA certification" },
  ];
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'pets' && <PetsView />}
        {currentView === 'books' && <BooksView />}
        {currentView === 'profile' && <ProfileView />}
      </div>

      {/* Bottom Navigation - Mobile First */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-around px-6 py-3 pb-0">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              currentView === 'dashboard'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => setCurrentView('stats')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              currentView === 'stats'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">Stats</span>
          </button>

          <button
            onClick={() => setCurrentView('pets')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              currentView === 'pets'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <Dog className="w-6 h-6" />
            <span className="text-xs">Pets</span>
          </button>

          <button
            onClick={() => setCurrentView('books')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              currentView === 'books'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Books</span>
          </button>

          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              currentView === 'profile'
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
