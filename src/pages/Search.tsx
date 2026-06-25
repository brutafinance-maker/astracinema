import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, RefreshCw, Film, Loader2 } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function SearchPage() {
  const { searchQuery, setSearchQuery, navigateTo, setPlayingMovie } = useRoute();
  const { myListIds, toggleFavorite } = useFavorites();
  const { activeProfile } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Search Results States
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced TMDB search
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const delayDebounceFn = setTimeout(async () => {
      try {
        let content: ContentItem[] = [];
        if (searchQuery.trim().length > 0) {
          content = await tmdbService.searchMulti(searchQuery);
        } else {
          // Empty search query: show trending suggestions!
          const trendingMovies = await tmdbService.getMoviesBySection('trending');
          const trendingSeries = await tmdbService.getSeriesBySection('trending');
          content = [...trendingMovies, ...trendingSeries].sort(() => 0.5 - Math.random());
        }

        if (isMounted) {
          setResults(content);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to search TMDb:', err);
          setError('Houve um problema ao buscar resultados do TMDb.');
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(delayDebounceFn);
      isMounted = false;
    };
  }, [searchQuery]);

  // Filter content based on active profile (Kids vs Normal)
  const profileFilteredContent = useMemo(() => {
    if (activeProfile?.isKid) {
      return results.filter(
        (item) => item.ageRating === 'L' || item.ageRating === '12' || item.genres.includes('Animação') || item.genres.includes('Kids')
      );
    }
    return results;
  }, [results, activeProfile]);

  // Extract unique genres from the current fetched results
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    profileFilteredContent.forEach((item) => {
      item.genres.forEach((g) => genresSet.add(g));
    });
    return Array.from(genresSet);
  }, [profileFilteredContent]);

  // Compute final filtered results instantly
  const filteredContent = useMemo(() => {
    return profileFilteredContent.filter((item) => {
      // 1. Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // 2. Genre filter
      const matchesGenre = selectedGenre === 'all' || item.genres.includes(selectedGenre);

      // 3. Rating filter
      const matchesRating = item.rating >= minRating;

      return matchesCategory && matchesGenre && matchesRating;
    });
  }, [profileFilteredContent, selectedCategory, selectedGenre, minRating]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGenre('all');
    setMinRating(0);
  };

  return (
    <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-8 flex-grow" id="search-page-panel">
      {/* Search Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
          Explorar Catálogo
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm">
          Busque instantaneamente por títulos do TMDb ou use nossos filtros inteligentes avançados.
        </p>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl">
        {/* Main query input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquise por títulos, séries ou filmes no TMDb..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#7C3AED]/80 focus:ring-1 focus:ring-[#7C3AED]/40 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 transition-all outline-none"
            id="search-page-input"
          />
          {isLoading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[#A855F7] animate-spin" />
            </div>
          )}
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories + Rating sliders */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Categories select pills */}
          <div className="md:col-span-5 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipo de Mídia</span>
            <div className="flex gap-2">
              {(['all', 'movie', 'series'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat === 'all' ? 'Tudo' : cat === 'movie' ? 'Filmes' : 'Séries'}
                </button>
              ))}
            </div>
          </div>

          {/* Genre select pill container */}
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Gênero</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-300 focus:border-[#7C3AED] outline-none cursor-pointer"
            >
              <option value="all">Todos os Gêneros</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Minimal rating filter */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              <span>Avaliação Mínima</span>
              <span className="text-[#A855F7] font-mono flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                {minRating > 0 ? `${minRating.toFixed(1)}` : 'Qualquer'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-[#7C3AED] bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Filters Shortcuts Bar */}
        {(searchQuery || selectedCategory !== 'all' || selectedGenre !== 'all' || minRating > 0) && (
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs">
            <span className="text-zinc-400">
              Filtros ativos. Encontrados <strong className="text-[#A855F7]">{filteredContent.length}</strong> resultados.
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Content Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6" id="search-grid-results">
            {filteredContent.map((movie) => (
              <div 
                key={movie.id}
                className="transform transition-transform duration-300 hover:scale-[1.02]"
              >
                <MovieCard
                  movie={movie}
                  onCardClick={(m) => navigateTo('details', m)}
                  onPlayClick={setPlayingMovie}
                  onToggleMyList={toggleFavorite}
                  isInMyList={myListIds.includes(movie.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum resultado encontrado"
            message="Experimente buscar por outros termos ou ajustar a avaliação de estrelas nos filtros."
            icon={<Film className="w-8 h-8 text-zinc-600" />}
            actionText="Limpar todos os filtros"
            onActionClick={clearFilters}
          />
        )}
      </div>
    </div>
  );
}
