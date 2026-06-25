import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { ContentItem } from '../types';

interface FavoritesContextType {
  myListIds: string[];
  toggleFavorite: (movie: ContentItem) => void;
  isFavorite: (movieId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useUser();
  const [myListIds, setMyListIds] = useState<string[]>([]);

  // Load favorites whenever activeProfile changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`astra_cinema_mylist_${activeProfile.id}`);
      if (saved) {
        setMyListIds(JSON.parse(saved));
      } else {
        // Default favorites based on profile type using real TMDb movie & series IDs
        const defaultList = activeProfile.isKid ? ['series-66732'] : ['movie-693134', 'movie-157336'];
        setMyListIds(defaultList);
        localStorage.setItem(`astra_cinema_mylist_${activeProfile.id}`, JSON.stringify(defaultList));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
      setMyListIds([]);
    }
  }, [activeProfile]);

  const toggleFavorite = (movie: ContentItem) => {
    setMyListIds((prev) => {
      let updated;
      if (prev.includes(movie.id)) {
        updated = prev.filter((id) => id !== movie.id);
      } else {
        updated = [...prev, movie.id];
      }
      try {
        localStorage.setItem(`astra_cinema_mylist_${activeProfile.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorites', e);
      }
      return updated;
    });
  };

  const isFavorite = (movieId: string) => {
    return myListIds.includes(movieId);
  };

  return (
    <FavoritesContext.Provider value={{ myListIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
