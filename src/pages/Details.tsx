import React, { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, Play, Star, Calendar, Clock, Film, Check, Plus, ShieldAlert, Sparkles, MessageSquare, Tv, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import ErrorState from '../components/ErrorState';
import { DetailsSkeleton } from '../components/SkeletonLoader';
import { FROM_EPISODES } from '../data/fromEpisodes';

export default function DetailsPage() {
  const { selectedMovie: movie, handleBack, navigateTo, setPlayingMovie } = useRoute();
  const { myListIds, toggleFavorite, isFavorite } = useFavorites();
  const { activeProfile } = useUser();
  const { currentUser } = useAuth();

  const [detailedMovie, setDetailedMovie] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

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

  // List of seasons for TV series (Netflix style)
  const seasonsList = useMemo(() => {
    const isFromSeries = currentMovie.title.toLowerCase().includes('from') || currentMovie.title.toLowerCase().includes('origem') || currentMovie.id.includes('124116');
    if (isFromSeries) {
      return [
        { season_number: 1, name: 'Temporada 1', episode_count: 10 },
        { season_number: 2, name: 'Temporada 2', episode_count: 10 },
        { season_number: 3, name: 'Temporada 3', episode_count: 10 },
      ];
    }
    if (currentMovie.seasons && currentMovie.seasons.length > 0) {
      return currentMovie.seasons.filter((s: any) => s.season_number > 0);
    }
    const count = currentMovie.seasonsCount || 1;
    return Array.from({ length: count }, (_, idx) => ({
      season_number: idx + 1,
      name: `Temporada ${idx + 1}`,
      episode_count: currentMovie.episodesCount ? Math.ceil(currentMovie.episodesCount / count) : 10
    }));
  }, [currentMovie]);

  // List of episodes for the selected season
  const currentEpisodes = useMemo(() => {
    if (currentMovie.category !== 'series') return [];
    
    const isFromSeries = currentMovie.title.toLowerCase().includes('from') || currentMovie.title.toLowerCase().includes('origem') || currentMovie.id.includes('124116');
    if (isFromSeries) {
      return FROM_EPISODES.filter((ep) => ep.season === selectedSeason).map((ep) => ({
        ...ep,
        thumbnailUrl: currentMovie.bannerUrl || ep.thumbnailUrl
      }));
    }
    
    const activeSeasonObj = seasonsList.find((s) => s.season_number === selectedSeason) || seasonsList[0];
    const epCount = activeSeasonObj?.episode_count || 10;
    
    return Array.from({ length: epCount }, (_, idx) => ({
      season: selectedSeason,
      episode: idx + 1,
      title: `Episódio ${idx + 1}`,
      airDate: `2024`,
      rating: `${(8.0 + (idx % 15) / 10).toFixed(1)}/10`,
      description: `Descrição em alta definição do episódio ${idx + 1} da temporada ${selectedSeason} de ${currentMovie.title}. Mistérios, conflitos e revelações aguardam os sobreviventes neste capítulo instigante.`,
      thumbnailUrl: currentMovie.bannerUrl
    }));
  }, [currentMovie, selectedSeason, seasonsList]);

  const handlePlayEpisode = (episodeNumber: number) => {
    if (!currentUser) {
      navigateTo('login');
    } else {
      const playableMovie = { 
        ...currentMovie, 
        selectedSeason: selectedSeason, 
        selectedEpisode: episodeNumber 
      };
      navigateTo('watch', playableMovie);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 flex flex-col text-white font-sans" id={`details-container-${currentMovie.id}`}>
      
      {/* 1. MASSIVE CINEMATIC BANNER (Netflix Hero Detail style) */}
      <div className="relative w-full h-[55vh] md:h-[70vh] bg-neutral-950 flex flex-col justify-end">
        
        {/* Banner Trailer Background */}
        {showTrailer && trailerReady && resolvedVideoId ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-55">
            <div className="absolute w-[122%] h-[122%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-105 pointer-events-none">
              <div id={`youtube-details-player-${movie.id}`} className="w-full h-full" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${currentMovie.bannerUrl})` }} />
        )}

        {/* Rich cinematic overlays for content legibility & movie vibe */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/90 via-[#09090B]/30 to-transparent z-10" />
        
        {/* Floating Controls Overlay (Top) */}
        <div className="absolute top-6 left-6 md:left-12 right-6 md:right-12 z-20 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-black/70 hover:bg-zinc-800 border border-zinc-850 text-white font-bold text-xs px-4.5 py-3 rounded-md transition-all duration-300 hover:scale-103 cursor-pointer"
            id="details-back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </button>

          {showTrailer && trailerReady && (
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-zinc-850 bg-black/70 hover:bg-zinc-800 text-white transition-all cursor-pointer"
              title={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? (
                <VolumeX className="w-4.5 h-4.5 text-zinc-400" />
              ) : (
                <Volume2 className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* Floating Title & Action Block (Bottom Left) */}
        <div className="relative z-25 px-6 md:px-12 pb-10 md:pb-14 max-w-4xl space-y-4 md:space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 text-[10px] font-black bg-[#7C3AED] text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-white fill-current" />
              Destaque Astra
            </span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-zinc-300 font-extrabold uppercase tracking-wide">
              {currentMovie.category === 'movie' ? 'Filme' : 'Série'}
            </span>
            {currentMovie.category === 'series' && (
              <span className="text-[10px] bg-[#A855F7]/10 border border-[#7C3AED]/30 px-2.5 py-0.5 rounded text-[#C084FC] font-extrabold uppercase tracking-wide">
                {seasonsList.length} {seasonsList.length === 1 ? 'Temporada' : 'Temporadas'}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-none uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {currentMovie.title}
          </h1>

          <p className="text-zinc-300 text-sm md:text-base max-w-2xl font-medium drop-shadow-md line-clamp-2 md:line-clamp-3">
            {currentMovie.description}
          </p>

          {/* Core Banner Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handlePlayEpisode(1)}
              className="flex items-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-black px-8 py-3.5 rounded-md transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl shadow-black/30"
              id="details-banner-play"
            >
              <Play className="w-5.5 h-5.5 fill-current" />
              <span>Assistir</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  navigateTo('login');
                } else {
                  toggleFavorite(currentMovie);
                }
              }}
              className={`flex items-center gap-2.5 border px-6 py-3.5 rounded-md transition-all duration-300 cursor-pointer ${
                isInMyList
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-purple-300 hover:bg-[#7C3AED]/30'
                  : 'bg-zinc-900/80 border-zinc-800 text-white hover:bg-zinc-800'
              }`}
              id="details-banner-mylist"
            >
              {isInMyList ? <Check className="w-5 h-5 text-purple-400" /> : <Plus className="w-5 h-5" />}
              <span>{isInMyList ? 'Na Minha Lista' : 'Minha Lista'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. TWO-COLUMN LAYOUT (Netflix Spec Grid) */}
      <div className="relative z-20 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mt-6">
        
        {/* LEFT COLUMN: Synopsis, Metadata & Episodes */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Metadata Badges Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs md:text-sm text-zinc-400 font-bold bg-zinc-950/40 p-4.5 rounded-xl border border-zinc-900/60">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              98% Compatível
            </span>
            <span>•</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>{currentMovie.year}</span>
            </div>
            <span>•</span>
            <span className="border border-zinc-700 text-zinc-300 px-1.5 py-0.2 rounded text-[10px] font-black">
              {currentMovie.ageRating}+
            </span>
            <span>•</span>
            <div className="flex items-center gap-1 text-zinc-300">
              {currentMovie.category === 'movie' ? (
                <>
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span>{currentMovie.duration}</span>
                </>
              ) : (
                <>
                  <Tv className="w-4 h-4 text-zinc-500" />
                  <span>{seasonsList.length} {seasonsList.length === 1 ? 'Temporada' : 'Temporadas'}</span>
                </>
              )}
            </div>
            <span>•</span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
              ULTRA HD 4K
            </span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
              HDR10+
            </span>
          </div>

          {/* Sinopse / Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">Sinopse</h3>
            <p className="text-zinc-200 text-base md:text-lg leading-relaxed font-normal">
              {currentMovie.description}
            </p>
          </div>

          {/* EPISODES & SEASONS LIST (Only for TV Shows) */}
          {currentMovie.category === 'series' && (
            <div className="space-y-6 pt-4">
              
              {/* Season Selection & Headers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-purple-400" />
                    <span>Lista de Episódios</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium font-mono">
                    {currentEpisodes.length} episódios disponíveis na temporada selecionada
                  </p>
                </div>

                {/* Season Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                    className="flex items-center justify-between gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-sm px-4 py-2.5 rounded-md min-w-[170px] cursor-pointer transition-colors"
                  >
                    <span>Temporada {selectedSeason}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSeasonDropdownOpen && (
                    <div className="absolute right-0 mt-2 py-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl w-full z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {seasonsList.map((season) => (
                        <button
                          key={season.season_number}
                          onClick={() => {
                            setSelectedSeason(season.season_number);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-zinc-800 transition-colors ${
                            selectedSeason === season.season_number ? 'text-purple-400 bg-zinc-850/50' : 'text-zinc-300'
                          }`}
                        >
                          {season.name} ({season.episode_count} episódios)
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical list of episodes (Netflix standard layout) */}
              <div className="space-y-4">
                {currentEpisodes.map((episode: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => handlePlayEpisode(episode.episode || episode.number)}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-zinc-950/30 border border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/30 transition-all cursor-pointer group"
                  >
                    {/* Index & Thumbnail */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xl md:text-2xl font-black text-zinc-600 group-hover:text-purple-400 transition-colors w-6 text-center font-mono">
                        {episode.episode || episode.number}
                      </span>
                      
                      <div className="w-32 md:w-44 aspect-video rounded-lg overflow-hidden bg-zinc-900 relative border border-zinc-850">
                        <img
                          src={episode.thumbnailUrl || "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=320&q=80"}
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {/* Play Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta & Synopsis */}
                    <div className="flex flex-col justify-center flex-grow space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm md:text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                          {episode.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          {episode.rating && <span className="text-amber-500 font-bold">★ {episode.rating}</span>}
                          {episode.airDate && <span>• {episode.airDate}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Cast, Director, Editorial Reviews */}
        <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-zinc-900 lg:pl-8">
          
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">Ficha Técnica</h3>
            
            {currentMovie.director && (
              <div className="space-y-0.5 text-xs md:text-sm">
                <span className="text-zinc-500 font-bold block uppercase tracking-wider text-[10px]">Direção</span>
                <p className="text-zinc-300 font-semibold">{currentMovie.director}</p>
              </div>
            )}

            {currentMovie.cast && currentMovie.cast.length > 0 && (
              <div className="space-y-0.5 text-xs md:text-sm">
                <span className="text-zinc-500 font-bold block uppercase tracking-wider text-[10px]">Elenco Principal</span>
                <p className="text-zinc-300 font-medium leading-relaxed">{currentMovie.cast.join(', ')}</p>
              </div>
            )}

            <div className="space-y-0.5 text-xs md:text-sm">
              <span className="text-zinc-500 font-bold block uppercase tracking-wider text-[10px]">Gêneros</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentMovie.genres.map((g, idx) => (
                  <span key={idx} className="bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px] font-bold px-2.5 py-0.5 rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Critique review block inside sidebar (extremely elegant) */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Opinião da Crítica</span>
            </h4>
            <div className="bg-zinc-900/30 border border-zinc-850 p-4.5 rounded-xl space-y-3">
              <p className="text-xs italic text-zinc-400 leading-relaxed font-medium">
                "Uma produção cinematográfica arrebatadora, integrada de forma impecável. Os visuais suntuosos e a narrativa psicológica profunda provam o valor desta obra prima moderna."
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Astra Editorial</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. SIMILAR TITLES SECTION */}
      {finalSimilarMovies.length > 0 && (
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mt-16 pt-10 border-t border-zinc-900 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Film className="w-5 h-5 text-purple-400" />
              <span>Títulos Semelhantes</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{finalSimilarMovies.length} títulos recomendados</span>
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
      )}

    </div>
  );
}
