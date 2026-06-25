import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewType, ContentItem } from '../types';
import { tmdbService } from '../services/tmdb';

interface RouteContextType {
  currentView: ViewType;
  selectedMovie: ContentItem | null;
  historyViews: ViewType[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  navigateTo: (view: ViewType, movieToSelect?: ContentItem | null) => void;
  handleBack: () => void;
  playingMovie: ContentItem | null;
  setPlayingMovie: (movie: ContentItem | null) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedMovie, setSelectedMovie] = useState<ContentItem | null>(null);
  const [historyViews, setHistoryViews] = useState<ViewType[]>(['home']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingMovie, setPlayingMovie] = useState<ContentItem | null>(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Sync state from path on load and popstate
  useEffect(() => {
    const syncRouteFromPath = async () => {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      
      let view: ViewType = 'home';
      let movieId: string | null = null;
      
      if (parts.length > 0) {
        const primary = parts[0];
        if (primary === 'watch' || primary === 'details') {
          view = primary as ViewType;
          if (parts.length > 1) {
            movieId = parts[1];
          }
        } else if (['movies', 'series', 'mylist', 'search', 'login', 'register'].includes(primary)) {
          view = primary as ViewType;
        }
      }
      
      setCurrentView(view);
      
      if (movieId) {
        try {
          const movieDetails = await tmdbService.getDetails(movieId);
          setSelectedMovie(movieDetails);
        } catch (e) {
          console.error('Failed to resolve movie details on route sync:', e);
        }
      } else {
        setSelectedMovie(null);
      }
    };

    // Initial load route resolution
    syncRouteFromPath();

    // Listen for back/forward popstate actions
    const handlePopState = () => {
      syncRouteFromPath();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: ViewType, movieToSelect: ContentItem | null = null) => {
    if (movieToSelect) {
      setSelectedMovie(movieToSelect);
    }
    setCurrentView(view);
    setHistoryViews((prev) => [...prev, view]);

    // Update address bar path
    let path = '/';
    if (view === 'watch' && movieToSelect) {
      path = `/watch/${movieToSelect.id}`;
    } else if (view === 'details' && movieToSelect) {
      path = `/details/${movieToSelect.id}`;
    } else if (view !== 'home') {
      path = `/${view}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ view, movieId: movieToSelect?.id }, '', path);
    }
  };

  const handleBack = () => {
    // Rely on window history pop if possible, otherwise state fallback
    if (window.history.state) {
      window.history.back();
    } else if (historyViews.length > 1) {
      const nextHistory = [...historyViews];
      nextHistory.pop();
      const lastView = nextHistory[nextHistory.length - 1];
      setHistoryViews(nextHistory);
      setCurrentView(lastView);
    } else {
      navigateTo('home');
    }
  };

  return (
    <RouteContext.Provider
      value={{
        currentView,
        selectedMovie,
        historyViews,
        searchQuery,
        setSearchQuery,
        navigateTo,
        handleBack,
        playingMovie,
        setPlayingMovie,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}
