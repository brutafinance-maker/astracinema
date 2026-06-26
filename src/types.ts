export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: 'movie' | 'series';
  rating: number; // e.g. 4.8 or 9.5 (we can use TMDb-like style: 9.3/10 or percentage)
  year: number;
  duration: string; // "2h 49min" or "4 Seasons"
  ageRating: 'L' | '12' | '14' | '16' | '18';
  genres: string[];
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string; // YouTube embed URL or fallback
  videoUrl?: string; // Video file or elegant mockup player
  isPopular: boolean;
  isNew: boolean;
  continueWatchProgress?: number; // percentage (0 to 100), if present it's in "Continuar Assistindo"
  cast: string[];
  director?: string;
  similarIds: string[];
  similarItems?: ContentItem[];
  seasonsCount?: number;
  episodesCount?: number;
  seasons?: any[];
  youtubeId?: string;
  gdriveId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
  hasRealTrailer?: boolean;
  playbackState?: {
    progress: number;      // percentage (0-100)
    duration: number;      // total duration in seconds
    lastPosition: number;  // last play position in seconds
  };
}

export type ViewType = 'home' | 'movies' | 'series' | 'mylist' | 'search' | 'details' | 'login' | 'register' | 'watch';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKid: boolean;
}
