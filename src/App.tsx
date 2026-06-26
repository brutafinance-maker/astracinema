import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { RouteProvider, useRoute } from './contexts/RouteContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { HistoryProvider } from './contexts/HistoryContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home';
import MoviesPage from './pages/Movies';
import SeriesPage from './pages/Series';
import MyListPage from './pages/MyList';
import SearchPage from './pages/Search';
import DetailsPage from './pages/Details';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import WatchPage from './pages/Watch';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

/**
 * AppContent resolves and mounts the active page based on the current RouteContext.
 * Wrapped inside MainLayout to maintain sticky navigation, profile switcher, and 
 * the persistent global video playback player modal.
 */
function AppContent() {
  const { currentView } = useRoute();

  const renderActivePage = () => {
    switch (currentView) {
      case 'login':
        return (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        );
      case 'register':
        return (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        );
      case 'mylist':
        return (
          <PrivateRoute>
            <MyListPage />
          </PrivateRoute>
        );
      case 'watch':
        return (
          <PrivateRoute>
            <WatchPage />
          </PrivateRoute>
        );
      case 'home':
        return <HomePage />;
      case 'movies':
        return <MoviesPage />;
      case 'series':
        return <SeriesPage />;
      case 'search':
        return <SearchPage />;
      case 'details':
        return <DetailsPage />;

      default:
        return <HomePage />;
    }
  };

  // Skip rendering Navbar and Footer layouts for standalone fullscreen screens
  if (currentView === 'login' || currentView === 'register' || currentView === 'watch') {
    return <>{renderActivePage()}</>;
  }

  return <MainLayout>{renderActivePage()}</MainLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <RouteProvider>
        <UserProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <AppContent />
            </HistoryProvider>
          </FavoritesProvider>
        </UserProvider>
      </RouteProvider>
    </AuthProvider>
  );
}
