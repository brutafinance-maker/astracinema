import React from 'react';
import { Play, Info, Star, Plus, Check, Heart } from 'lucide-react';
import { ContentItem } from '../types';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';

interface MovieCardProps {
  key?: string;
  movie: ContentItem;
  onCardClick?: (movie: ContentItem) => void;
  onPlayClick?: (movie: ContentItem) => void;
  onToggleMyList?: (movie: ContentItem) => void;
  isInMyList?: boolean;
}

export default function MovieCard({
  movie,
  onCardClick,
  onPlayClick,
  onToggleMyList,
  isInMyList,
}: MovieCardProps) {
  // Pull from contexts if props are not explicitly provided
  const routeCtx = useRoute();
  const favoritesCtx = useFavorites();
  const historyCtx = useHistory();
  const { currentUser } = useAuth();

  const handleCardClick = onCardClick || ((m) => routeCtx.navigateTo('details', m));
  const handlePlayClick = onPlayClick || ((m) => {
    // Add to watch history when user hits play
    historyCtx.addToHistory(m.id, historyCtx.getMovieProgress(m.id) || 10);
    routeCtx.navigateTo('watch', m);
  });
  const handleToggleMyList = onToggleMyList || favoritesCtx.toggleFavorite;
  const isFavorited = isInMyList !== undefined ? isInMyList : favoritesCtx.isFavorite(movie.id);

  // Look up actual user progress from HistoryContext or fallback to initial content item progress
  const userProgress = historyCtx.getMovieProgress(movie.id) || movie.continueWatchProgress;

  return (
    <div 
      className="group relative flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/40 cursor-pointer select-none transition-all duration-300 hover:scale-[1.04] hover:border-[#7C3AED]/40 hover:shadow-xl hover:shadow-[#7C3AED]/20"
      onClick={() => handleCardClick(movie)}
      id={`movie-card-${movie.id}`}
    >
      {/* High Quality Poster Image */}
      <img
        src={movie.posterUrl}
        alt={movie.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* Floating Badges (Rating, Year) */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        <div className="flex items-center gap-1 bg-[#09090B]/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/20">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{movie.rating}</span>
        </div>
        {movie.isNew && (
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-1.5 py-0.5 rounded text-[9px] font-black text-white tracking-wider text-center uppercase">
            Novo
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 z-10">
        <div className="bg-[#09090B]/80 text-[10px] font-bold text-zinc-300 px-1.5 py-0.5 rounded-md border border-zinc-700/50">
          {movie.ageRating}+
        </div>
      </div>

      {/* Continuar Assistindo Progress Bar */}
      {userProgress !== undefined && userProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 z-10">
          <div 
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7]" 
            style={{ width: `${userProgress}%` }}
          />
        </div>
      )}

      {/* Elegant Hover Overlay details */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/85 to-[#09090B]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
        
        {/* Play Icon in the Center */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (!currentUser) {
              routeCtx.navigateTo('login');
            } else {
              handlePlayClick(movie);
            }
          }}
          className="absolute inset-x-0 top-1/3 mx-auto w-12 h-12 bg-white/10 hover:bg-[#7C3AED] hover:scale-110 text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 backdrop-blur-md"
        >
          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
        </div>

        {/* Info & Details */}
        <div className="space-y-1 md:space-y-1.5">
          <h3 className="text-white text-xs sm:text-sm font-black tracking-tight line-clamp-1 uppercase">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.duration}</span>
          </div>

          <div className="flex flex-wrap gap-0.5 pt-1">
            {movie.genres.slice(0, 2).map((g, idx) => (
              <span key={idx} className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>

          {/* Action buttons at bottom */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(movie);
              }}
              className="flex items-center gap-1 text-[10px] text-zinc-300 hover:text-white transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>Detalhes</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  routeCtx.navigateTo('login');
                } else {
                  handleToggleMyList(movie);
                }
              }}
              className="p-1 rounded bg-zinc-800/80 hover:bg-[#7C3AED]/20 hover:text-[#A855F7] text-zinc-400 transition-all duration-200"
              title={isFavorited ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
            >
              {isFavorited ? (
                <Heart className="w-3.5 h-3.5 fill-[#7C3AED] text-[#7C3AED]" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
