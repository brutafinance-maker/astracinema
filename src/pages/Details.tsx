import React, { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, Play, Star, Calendar, Clock, Film, Check, Plus, ShieldAlert, Sparkles, MessageSquare, Tv, Volume2, VolumeX } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';
import { DetailsSkeleton } from '../components/SkeletonLoader';

export default function DetailsPage() {
  const { selectedMovie: movie, handleBack, navigateTo, setPlayingMovie } = useRoute();
  const { myListIds, toggleFavorite, isFavorite } = useFavorites();
  const { activeProfile } = useUser();
  const { currentUser } = useAuth();

  const [detailedMovie, setDetailedMovie] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load complete rich details on mount
  useEffect(() => {
    if (!movie) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchFullMetadata() {
      try {
        const fullDetails = await tmdbService.getDetails(movie.id);
        if (isMounted) {
          setDetailedMovie(fullDetails);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error(`Failed to load metadata for ${movie.id}:`, err);
        if (isMounted) {
          // If TMDb detail endpoint fails, we still have the basic movie item
          setDetailedMovie(movie);
          setIsLoading(false);
        }
      }
    }

    fetchFullMetadata();

    return () => {
      isMounted = false;
    };
  }, [movie?.id]);

  // Guard against undefined selectedMovie
  if (!movie) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <ErrorState 
          title="Nenhum título selecionado" 
          message="Por favor, volte para a tela inicial e selecione um filme ou série para ver os detalhes."
          onRetry={handleBack}
        />
      </div>
    );
  }

  // Use the detailed item if ready, otherwise fall back immediately to basic item
  const currentMovie = detailedMovie || movie;

  const isInMyList = isFavorite(currentMovie.id);

  // Filter similar items based on activeProfile (Kids mode limit)
  const finalSimilarMovies = useMemo(() => {
    const rawSimilar = currentMovie.similarItems || [];
    if (activeProfile?.isKid) {
      return rawSimilar.filter(
        (item) => item.ageRating === 'L' || item.ageRating === '12' || item.genres.includes('Animação') || item.genres.includes('Kids')
      );
    }
    return rawSimilar;
  }, [currentMovie.similarItems, activeProfile]);

  // Trailer background player state in Details
  const [isMuted, setIsMuted] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);

  const resolvedVideoId = useMemo(() => {
    const target = currentMovie;
    if (target.youtubeId) return target.youtubeId;
    if (!target.trailerUrl) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = target.trailerUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [currentMovie]);

  const hasTrailer = !!resolvedVideoId;

  // Reset states on movie change
  useEffect(() => {
    setShowTrailer(false);
    setTrailerReady(false);
    setPlayer(null);
  }, [movie?.id]);

  // Autoplay delay triggers after 1.5 seconds
  useEffect(() => {
    if (!hasTrailer) return;

    const timer = setTimeout(() => {
      setShowTrailer(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasTrailer, movie?.id]);

  // Set up the premium YouTube Player inside Details Page Banner
  useEffect(() => {
    if (!showTrailer || !resolvedVideoId || player) return;

    let playerInstance: any = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerInstance = new window.YT.Player(`youtube-details-player-${movie.id}`, {
        videoId: resolvedVideoId,
        playerVars: {
          autoplay: 1,
          mute: isMuted ? 1 : 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: resolvedVideoId,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 0,
          cc_load_policy: 0,
          autohide: 1,
          disablekb: 1
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            setTrailerReady(true);
            setPlayer(event.target);
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              event.target.playVideo();
            }
          }
        }
      });
    };

    if (!window.YT) {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          initPlayer();
        }
      }, 100);

      return () => {
        clearInterval(checkYT);
        if (playerInstance && playerInstance.destroy) {
          playerInstance.destroy();
        }
      };
    } else {
      initPlayer();
    }

    return () => {
      if (playerInstance && playerInstance.destroy) {
        playerInstance.destroy();
      }
    };
  }, [showTrailer, resolvedVideoId, movie.id]);

  // Audio Control Helper
  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-16 flex flex-col" id={`details-container-${currentMovie.id}`}>
      
      {/* Dynamic Background Banner */}
      <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden bg-black">
        {/* Cinematic YouTube Trailer */}
        {showTrailer && trailerReady && resolvedVideoId ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-40">
            {/* Aspect-ratio cover scale container to hide black bars & branding */}
            <div className="absolute w-[122%] h-[122%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-105 pointer-events-none">
              <div id={`youtube-details-player-${movie.id}`} className="w-full h-full" />
            </div>
          </div>
        ) : (
          <img 
            src={currentMovie.bannerUrl} 
            alt={currentMovie.title} 
            className="w-full h-full object-cover opacity-35"
          />
        )}

        {/* Gradients to blend banner naturally with deep black layout */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-transparent to-transparent z-10" />
        
        {/* Interactive Floating Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 md:left-12 z-20 flex items-center gap-2 bg-black/80 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs px-4 py-2.5 rounded hover:scale-105 transition-all cursor-pointer"
          id="details-back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Cinematic sound toggler overlay */}
        {showTrailer && trailerReady && (
          <button
            onClick={toggleMute}
            className="absolute top-6 right-6 md:right-12 z-20 flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800/80 bg-black/80 hover:bg-zinc-800 text-white transition-all cursor-pointer"
            title={isMuted ? "Ativar som do trailer" : "Desativar som do trailer"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#A855F7] animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Main Details Section */}
      <div className="relative z-10 px-6 md:px-12 -mt-20 md:-mt-32 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Left Column: Poster & Action Buttons */}
        <div className="md:col-span-4 flex flex-col items-center gap-6">
          <div className="w-56 md:w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/80 group">
            <img 
              src={currentMovie.posterUrl} 
              alt={currentMovie.title} 
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          </div>
          
          {/* Main Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (!currentUser) {
                  navigateTo('login');
                } else {
                  navigateTo('watch', currentMovie);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded hover:bg-zinc-200 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
              id="details-action-watch"
            >
              <Play className="w-5 h-5 fill-current text-black" />
              <span>Assistir Agora</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  navigateTo('login');
                } else {
                  toggleFavorite(currentMovie);
                }
              }}
              className={`w-full flex items-center justify-center gap-2 border py-3.5 rounded transition-all duration-200 cursor-pointer ${
                isInMyList
                  ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-[#A855F7] hover:bg-[#7C3AED]/20'
                  : 'bg-zinc-850/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              id="details-action-mylist"
            >
              {isInMyList ? (
                <>
                  <Check className="w-5 h-5 text-[#A855F7]" />
                  <span>Na Minha Lista</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Adicionar à Lista</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Descriptions & Metadata */}
        <div className="md:col-span-8 flex flex-col justify-start gap-6 pt-0 md:pt-12">
          
          {/* Title Area */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-extrabold bg-[#7C3AED]/20 text-[#A855F7] px-2 py-0.5 rounded border border-[#7C3AED]/30 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-[#A855F7]" />
                Recomendado
              </span>
              <span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-semibold uppercase">
                {currentMovie.category === 'movie' ? 'Filme' : 'Série'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">
              {currentMovie.title}
            </h1>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs md:text-sm text-zinc-400 font-medium">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold">{currentMovie.rating}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{currentMovie.year}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{currentMovie.duration}</span>
            </div>
            <span>•</span>
            <span className="font-extrabold border border-zinc-700 text-zinc-300 px-2 py-0.2 rounded text-[11px]">
              Classificação: {currentMovie.ageRating}+
            </span>

            {/* Dynamic series badges */}
            {currentMovie.category === 'series' && currentMovie.episodesCount && (
              <>
                <span>•</span>
                <span className="font-bold text-[#A855F7] bg-[#7C3AED]/10 px-2 py-0.2 rounded text-[11px] border border-[#7C3AED]/20">
                  {currentMovie.episodesCount} Episódios
                </span>
              </>
            )}
          </div>

          {/* Genres pills */}
          <div className="flex flex-wrap gap-1.5">
            {currentMovie.genres.map((g, idx) => (
              <span 
                key={idx} 
                className="text-xs font-semibold text-zinc-400 bg-zinc-900/50 border border-zinc-800/60 px-3 py-1 rounded"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Narrative description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sinopse</h3>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              {currentMovie.description}
            </p>
          </div>

          {/* Cast & Crew listing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
            {currentMovie.director && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Diretor</span>
                <p className="text-white text-xs md:text-sm font-semibold">{currentMovie.director}</p>
              </div>
            )}
            {currentMovie.cast && currentMovie.cast.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Elenco Principal</span>
                <p className="text-white text-xs md:text-sm font-semibold truncate" title={currentMovie.cast.join(', ')}>
                  {currentMovie.cast.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* TV Series Seasons details list */}
          {currentMovie.category === 'series' && currentMovie.seasons && currentMovie.seasons.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-900 space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#A855F7]" />
                <span>Temporadas ({currentMovie.seasonsCount || currentMovie.seasons.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentMovie.seasons
                  .filter((s: any) => s.season_number > 0) // exclude specials
                  .map((season: any) => (
                    <div 
                      key={season.id} 
                      className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 flex gap-3 hover:border-zinc-800 transition-all group"
                    >
                      {season.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w154${season.poster_path}`} 
                          alt={season.name}
                          className="w-12 h-18 object-cover rounded-lg border border-zinc-900 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] text-zinc-600">
                          Série
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#A855F7] transition-colors">{season.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{season.episode_count} episódios</p>
                        {season.air_date && (
                          <p className="text-[10px] text-zinc-600 mt-1">Estreia: {new Date(season.air_date).getFullYear()}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* User Review Section */}
          <div className="mt-4 pt-4 border-t border-zinc-900 space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Opinião da Crítica</span>
            </h4>
            <div className="bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-xl">
              <p className="text-xs italic text-zinc-400 leading-relaxed">
                "Uma produção cinematográfica arrebatadora, agora integrada em tempo real. Os visuais e a narrativa profunda mostram por que este título é um marco."
              </p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Astra Editorial</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Similar Titles / Recomendados Row */}
      {isLoading ? (
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mt-16 space-y-4">
          <div className="h-4 w-48 bg-zinc-900 rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : finalSimilarMovies.length > 0 ? (
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mt-16 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Film className="w-5 h-5 text-[#A855F7]" />
              <span>Títulos Semelhantes</span>
            </h2>
            <span className="text-xs text-zinc-500 font-medium">{finalSimilarMovies.length} títulos relacionados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {finalSimilarMovies.map((similarMovie) => (
              <div 
                key={similarMovie.id}
                className="transform transition-transform duration-300 hover:scale-[1.03]"
              >
                <MovieCard
                  movie={similarMovie}
                  onCardClick={(m) => navigateTo('details', m)}
                  onPlayClick={setPlayingMovie}
                  onToggleMyList={toggleFavorite}
                  isInMyList={myListIds.includes(similarMovie.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
}
