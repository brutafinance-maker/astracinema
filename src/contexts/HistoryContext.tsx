import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

export interface WatchHistoryItem {
  movieId: string;
  progress: number; // percentage (0 to 100)
  watchedAt: string;
  season?: number;
  episode?: number;
}

interface HistoryContextType {
  history: WatchHistoryItem[];
  addToHistory: (movieId: string, progress?: number, season?: number, episode?: number) => void;
  clearHistory: () => void;
  getMovieProgress: (movieId: string) => number;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useUser();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Load history when active profile changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`astra_cinema_history_${activeProfile.id}`);
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        // Provide mock initial progress for a few movies to populate "Continuar Assistindo" naturally
        const defaultHistory: WatchHistoryItem[] = activeProfile.isKid
          ? [{ movieId: 'stranger-things', progress: 45, watchedAt: new Date().toISOString() }]
          : [
              { movieId: 'dune-2', progress: 75, watchedAt: new Date().toISOString() },
              { movieId: 'interstellar', progress: 20, watchedAt: new Date().toISOString() },
            ];
        setHistory(defaultHistory);
        localStorage.setItem(`astra_cinema_history_${activeProfile.id}`, JSON.stringify(defaultHistory));
      }
    } catch (e) {
      console.error('Failed to load history', e);
      setHistory([]);
    }
  }, [activeProfile]);

  const addToHistory = (movieId: string, progress: number = 0, season?: number, episode?: number) => {
    setHistory((prev) => {
      // Remove any existing entry for this movie
      const filtered = prev.filter((item) => item.movieId !== movieId);
      
      // If we don't have new season/episode but had them previously, preserve them
      const existing = prev.find((item) => item.movieId === movieId);
      const finalSeason = season !== undefined ? season : existing?.season;
      const finalEpisode = episode !== undefined ? episode : existing?.episode;

      const updated = [
        {
          movieId,
          progress: Math.min(100, Math.max(0, progress)),
          watchedAt: new Date().toISOString(),
          season: finalSeason,
          episode: finalEpisode,
        },
        ...filtered,
      ];
      try {
        localStorage.setItem(`astra_cinema_history_${activeProfile.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.setItem(`astra_cinema_history_${activeProfile.id}`, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  const getMovieProgress = (movieId: string): number => {
    const item = history.find((h) => h.movieId === movieId);
    return item ? item.progress : 0;
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, getMovieProgress }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
