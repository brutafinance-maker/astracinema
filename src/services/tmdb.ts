// TMDb (The Movie Database) Integration Service for Astra Cinema
import { ContentItem } from '../types';

const TMDB_API_KEY = 'c29aa2cb19036b5a81ebab9d223d80f2';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache to store API responses and avoid duplicate requests
const cache = new Map<string, any>();

// Genre ID map for Movies & TV Series to Portuguese human labels
const GENRE_MAP: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
  // TV Series Genre IDs
  10759: 'Ação & Aventura',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Ficção Científica & Fantasia',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'Guerra & Política'
};

/**
 * Determine Portuguese age rating based on genres or adult flag
 */
function getAgeRating(genres: string[], adult: boolean = false): 'L' | '12' | '14' | '16' | '18' {
  if (adult) return '18';
  const lowercaseGenres = genres.map(g => g.toLowerCase());
  if (lowercaseGenres.some(g => g.includes('terror') || g.includes('horror') || g.includes('crime') || g.includes('suspense') || g.includes('thriller'))) {
    return '16';
  }
  if (lowercaseGenres.some(g => g.includes('ação') || g.includes('action') || g.includes('guerra') || g.includes('war') || g.includes('drama'))) {
    return '14';
  }
  if (lowercaseGenres.some(g => g.includes('ficção') || g.includes('aventura') || g.includes('mystery') || g.includes('mistério'))) {
    return '12';
  }
  return 'L';
}

/**
 * Convert runtime/seasons to human duration text
 */
function getDurationText(item: any, category: 'movie' | 'series'): string {
  if (category === 'movie') {
    const runtime = item.runtime || item.episode_run_time?.[0];
    if (runtime) {
      const hours = Math.floor(runtime / 60);
      const minutes = runtime % 60;
      return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    }
    return '2h 10min'; // fallback
  } else {
    const seasons = item.number_of_seasons || (item.seasons ? item.seasons.length : 1) || 1;
    return seasons === 1 ? '1 Temporada' : `${seasons} Temporadas`;
  }
}

/**
 * Map TMDB raw results to Astra Cinema's ContentItem
 */
export function mapTMDBItem(item: any, category: 'movie' | 'series', isRecursion: boolean = false): ContentItem {
  const title = item.title || item.name || item.original_title || item.original_name || 'Título Indisponível';
  
  // Resolve genres
  let genres: string[] = [];
  if (item.genres && Array.isArray(item.genres)) {
    genres = item.genres.map((g: any) => g.name);
  } else if (item.genre_ids && Array.isArray(item.genre_ids)) {
    genres = item.genre_ids.map((id: number) => GENRE_MAP[id]).filter(Boolean);
  }
  if (genres.length === 0) {
    genres = category === 'movie' ? ['Cinema'] : ['Série'];
  }

  const voteAverage = item.vote_average || 0;
  const rating = parseFloat(voteAverage.toFixed(1));

  const releaseDate = item.release_date || item.first_air_date || '2024-01-01';
  const year = parseInt(releaseDate.substring(0, 4)) || 2024;

  const isNew = year >= 2024 || (item.popularity && item.popularity > 250);
  const isPopular = (item.popularity && item.popularity > 100) || (item.vote_count && item.vote_count > 500);

  // Image assets mapping
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80`;
  
  const bannerUrl = item.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80`;

  // Default backup trailers in case TMDb details does not find a trailer
  const defaultTrailers = [
    'https://www.youtube.com/embed/Way9Dexny3w', // Dune 2
    'https://www.youtube.com/embed/zSWdZAToXRw', // Interstellar
    'https://www.youtube.com/embed/LDG9bisJEaI', // Batman Dark Knight
    'https://www.youtube.com/embed/b9EkMc79ZSU', // Stranger Things
    'https://www.youtube.com/embed/HhesaQXLuRY'  // Arcane
  ];
  const trailerUrl = defaultTrailers[Math.abs(item.id) % defaultTrailers.length];

  // Map cast
  let cast: string[] = [];
  let director: string | undefined = undefined;
  if (item.credits) {
    if (item.credits.cast && Array.isArray(item.credits.cast)) {
      cast = item.credits.cast.slice(0, 5).map((actor: any) => actor.name);
    }
    if (item.credits.crew && Array.isArray(item.credits.crew)) {
      const dirObj = item.credits.crew.find((member: any) => member.job === 'Director');
      if (dirObj) director = dirObj.name;
    }
  }

  // Map similarIds and similarItems recursively with recursion guard
  let similarIds: string[] = [];
  let similarItemsList: ContentItem[] = [];
  if (item.similar && item.similar.results && Array.isArray(item.similar.results)) {
    similarIds = item.similar.results.slice(0, 6).map((sim: any) => `${category}-${sim.id}`);
    if (!isRecursion) {
      similarItemsList = item.similar.results.slice(0, 6).map((sim: any) => mapTMDBItem(sim, category, true));
    }
  }

  // Look for videos/trailers dynamically
  let finalTrailerUrl = trailerUrl;
  let youtubeId = '';
  let hasRealTrailer = false;

  if (item.videos && item.videos.results && Array.isArray(item.videos.results)) {
    const ytVideos = item.videos.results.filter((v: any) => v.site === 'YouTube');
    if (ytVideos.length > 0) {
      const officialTrailer = ytVideos.find(
        (v: any) => v.type === 'Trailer' && (v.name.toLowerCase().includes('oficial') || v.name.toLowerCase().includes('official'))
      );
      const anyTrailer = ytVideos.find((v: any) => v.type === 'Trailer');
      const officialTeaser = ytVideos.find(
        (v: any) => v.type === 'Teaser' && (v.name.toLowerCase().includes('oficial') || v.name.toLowerCase().includes('official'))
      );
      const anyTeaser = ytVideos.find((v: any) => v.type === 'Teaser');
      const anyClip = ytVideos.find((v: any) => v.type === 'Clip' || v.type === 'Featurette');

      const bestVideo = officialTrailer || anyTrailer || officialTeaser || anyTeaser || anyClip || ytVideos[0];
      if (bestVideo) {
        finalTrailerUrl = `https://www.youtube.com/embed/${bestVideo.key}`;
        youtubeId = bestVideo.key;
        hasRealTrailer = true;
      }
    }
  }

  const isBackrooms = title.toLowerCase().includes('backrooms');
  const mappedId = isBackrooms ? 'backrooms' : `${category}-${item.id}`;
  const mappedTitle = isBackrooms ? 'Backrooms' : title;

  return {
    id: mappedId,
    title: mappedTitle,
    description: item.overview || 'Nenhuma sinopse disponível em português para este título.',
    category,
    rating,
    year,
    duration: getDurationText(item, category),
    ageRating: getAgeRating(genres, item.adult),
    genres,
    posterUrl,
    bannerUrl,
    trailerUrl: finalTrailerUrl,
    youtubeId: youtubeId || undefined,
    gdriveId: isBackrooms ? '1r5pCkp-onoHIje19Qb_573DN01vS34Dc' : undefined,
    hasRealTrailer,
    isPopular,
    isNew,
    cast,
    director,
    similarIds,
    similarItems: similarItemsList,
    seasonsCount: item.number_of_seasons,
    episodesCount: item.number_of_episodes,
    seasons: item.seasons
  };
}

/**
 * Fetch helper with built-in cache and query parameters
 */
async function fetchFromTMDB(endpoint: string, params: Record<string, string | number> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
    ...params as any
  });
  
  const cacheKey = `${endpoint}?${queryParams.toString()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDb: ${response.statusText}`);
  }
  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
}

export const tmdbService = {
  /**
   * Fetch movies based on sections: trending, popular, top_rated, action, horror, scifi, animation
   */
  async getMoviesBySection(section: string, page: number = 1): Promise<ContentItem[]> {
    try {
      let endpoint = '/movie/popular';
      const params: Record<string, string | number> = { page };

      switch (section) {
        case 'trending':
          endpoint = '/trending/movie/week';
          break;
        case 'popular':
          endpoint = '/movie/popular';
          break;
        case 'top_rated':
          endpoint = '/movie/top_rated';
          break;
        case 'action':
          endpoint = '/discover/movie';
          params.with_genres = 28;
          break;
        case 'horror':
          endpoint = '/discover/movie';
          params.with_genres = 27;
          break;
        case 'scifi':
          endpoint = '/discover/movie';
          params.with_genres = 878;
          break;
        case 'animation':
          endpoint = '/discover/movie';
          params.with_genres = 16;
          break;
      }

      const res = await fetchFromTMDB(endpoint, params);
      return (res.results || []).map((item: any) => mapTMDBItem(item, 'movie'));
    } catch (error) {
      console.error(`Error loading movie section ${section}:`, error);
      throw error;
    }
  },

  /**
   * Fetch TV series based on sections: trending, popular, top_rated, drama, animation, scifi
   */
  async getSeriesBySection(section: string, page: number = 1): Promise<ContentItem[]> {
    try {
      let endpoint = '/tv/popular';
      const params: Record<string, string | number> = { page };

      switch (section) {
        case 'trending':
          endpoint = '/trending/tv/week';
          break;
        case 'popular':
          endpoint = '/tv/popular';
          break;
        case 'top_rated':
          endpoint = '/tv/top_rated';
          break;
        case 'drama':
          endpoint = '/discover/tv';
          params.with_genres = 18;
          break;
        case 'animation':
          endpoint = '/discover/tv';
          params.with_genres = 16;
          break;
        case 'scifi':
          endpoint = '/discover/tv';
          params.with_genres = 10765; // Sci-Fi & Fantasy TV genre ID
          break;
      }

      const res = await fetchFromTMDB(endpoint, params);
      return (res.results || []).map((item: any) => mapTMDBItem(item, 'series'));
    } catch (error) {
      console.error(`Error loading series section ${section}:`, error);
      throw error;
    }
  },

  /**
   * Unified Search on TMDb for movies and series
   */
  async searchMulti(query: string, page: number = 1): Promise<ContentItem[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetchFromTMDB('/search/multi', { query, page });
      return (res.results || [])
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => {
          const category = item.media_type === 'tv' ? 'series' : 'movie';
          return mapTMDBItem(item, category);
        });
    } catch (error) {
      console.error('Error searching Multi in TMDb:', error);
      throw error;
    }
  },

  /**
   * Fetch full details for a movie or tv show with appended videos, credits, similar
   */
  async getDetails(id: string): Promise<ContentItem> {
    try {
      let tmdbId: number;
      let category: 'movie' | 'series' = 'movie';

      if (id === 'backrooms' || id === 'movie-backrooms') {
        try {
          const searchRes = await fetchFromTMDB('/search/movie', { query: 'The Backrooms' });
          if (searchRes && searchRes.results && searchRes.results.length > 0) {
            tmdbId = searchRes.results[0].id;
          } else {
            tmdbId = 1084244;
          }
        } catch (e) {
          tmdbId = 1084244;
        }
      } else {
        const dividerIndex = id.indexOf('-');
        if (dividerIndex === -1) {
          throw new Error('Invalid ID format. Expected format: category-id');
        }
        category = id.substring(0, dividerIndex) as 'movie' | 'series';
        const tmdbIdStr = id.substring(dividerIndex + 1);
        tmdbId = parseInt(tmdbIdStr);

        if (isNaN(tmdbId)) {
          throw new Error('ID has non-numeric identifier');
        }
      }

      const endpoint = category === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
      const res = await fetchFromTMDB(endpoint, {
        append_to_response: 'videos,credits,similar'
      });
      
      const mapped = mapTMDBItem(res, category);

      // Fallback to English/original trailer if no Portuguese trailer is found
      if (!mapped.hasRealTrailer) {
        try {
          const fallbackRes = await fetchFromTMDB(`${endpoint}/videos`, { language: 'en-US' });
          if (fallbackRes && fallbackRes.results && Array.isArray(fallbackRes.results)) {
            const ytVideos = fallbackRes.results.filter((v: any) => v.site === 'YouTube');
            if (ytVideos.length > 0) {
              const officialTrailer = ytVideos.find(
                (v: any) => v.type === 'Trailer' && (v.name.toLowerCase().includes('official') || v.name.toLowerCase().includes('trailer'))
              );
              const anyTrailer = ytVideos.find((v: any) => v.type === 'Trailer');
              const officialTeaser = ytVideos.find(
                (v: any) => v.type === 'Teaser' && (v.name.toLowerCase().includes('official') || v.name.toLowerCase().includes('teaser'))
              );
              const anyTeaser = ytVideos.find((v: any) => v.type === 'Teaser');
              const anyClip = ytVideos.find((v: any) => v.type === 'Clip' || v.type === 'Featurette');

              const bestVideo = officialTrailer || anyTrailer || officialTeaser || anyTeaser || anyClip || ytVideos[0];
              if (bestVideo) {
                mapped.trailerUrl = `https://www.youtube.com/embed/${bestVideo.key}`;
                mapped.youtubeId = bestVideo.key;
                mapped.hasRealTrailer = true;
              }
            }
          }
        } catch (fallbackError) {
          console.warn(`Failed fallback English video fetch for ${id}:`, fallbackError);
        }
      }

      return mapped;
    } catch (error) {
      console.error(`Error loading details for ${id}:`, error);
      throw error;
    }
  }
};
