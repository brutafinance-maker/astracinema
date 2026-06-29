import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Info, Star, Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentItem } from '../types';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { tmdbService } from '../services/tmdb';

interface HeroProps {
  movie: ContentItem;
}

// Global YouTube YT Player API declaration
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function Hero({ movie }: HeroProps) {
  const { navigateTo, setPlayingMovie } = useRoute();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currentUser } = useAuth();
  const historyCtx = useHistory();

  const isInMyList = isFavorite(movie.id);

  // States
  const [isMobile, setIsMobile] = useState(false);
  const [detailedMovie, setDetailedMovie] = useState<ContentItem | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if it is mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch complete details including videos for this specific movie
  useEffect(() => {
    let isMounted = true;
    
    // Reset states immediately when movie changes to avoid playing previous movie's trailer
    setDetailedMovie(null);
    setShowTrailer(false);
    setTrailerReady(false);
    setIsPlayerActive(false);
    setPlayer(null);
    setProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    async function loadHeroMetadata() {
      try {
        const details = await tmdbService.getDetails(movie.id);
        if (isMounted) {
          setDetailedMovie(details);
        }
      } catch (err) {
        console.warn(`Failed to fetch complete trailer/details for Hero item ${movie.id}:`, err);
        if (isMounted) {
          setDetailedMovie(movie); // Fallback to basic movie data
        }
      }
    }

    loadHeroMetadata();

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [movie.id]);

  // Extract the YouTube Video ID from resolved detailedMovie or props
  const resolvedVideoId = useMemo(() => {
    const target = detailedMovie || movie;
    if (target.youtubeId) return target.youtubeId;
    if (!target.trailerUrl) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = target.trailerUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [detailedMovie, movie]);

  const hasTrailer = !!resolvedVideoId;

  // Autoplay delay triggers after 2 seconds on desktop/tablet only
  useEffect(() => {
    if (isMobile) return;
    if (!hasTrailer) return;

    const timer = setTimeout(() => {
      setShowTrailer(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasTrailer, isMobile, movie.id]);

  // Set up the premium YouTube Player
  useEffect(() => {
    if (!showTrailer || !resolvedVideoId || player) return;

    let playerInstance: any = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerInstance = new window.YT.Player(`youtube-hero-player-${movie.id}`, {
        videoId: resolvedVideoId,
        playerVars: {
          autoplay: 1,
          mute: isMuted ? 1 : 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: resolvedVideoId, // Required for loop in YT Iframe
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
            setIsPlayerActive(true);
            setPlayer(event.target);

            // Start polling progress bar
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            progressIntervalRef.current = setInterval(() => {
              try {
                if (event.target && typeof event.target.getCurrentTime === 'function') {
                  const currentTime = event.target.getCurrentTime();
                  const duration = event.target.getDuration();
                  if (duration > 0) {
                    setProgress((currentTime / duration) * 100);
                  }
                }
              } catch (e) {
                // Polling safety
              }
            }, 300);
          },
          onStateChange: (event: any) => {
            // State: 0 = Ended (Force loop if YT loop parameter behaves unexpectedly)
            if (event.data === 0) {
              event.target.playVideo();
              setProgress(0);
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

  // Replay Control Helper
  const handleReplay = () => {
    if (player) {
      player.seekTo(0);
      player.playVideo();
      setProgress(0);
    }
  };

  const handleMobilePlayTrailer = () => {
    setShowTrailer(true);
  };

  const activeItem = detailedMovie || movie;
  const displayGenres = activeItem.genres.slice(0, 3);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div 
      className="relative w-full h-[85vh] md:h-[95vh] bg-cover bg-center flex items-end justify-start overflow-hidden pt-20"
      style={{ backgroundImage: `url(${activeItem.bannerUrl})` }}
      id={`hero-banner-${activeItem.id}`}
    >
      {/* Background Premium Video Trailer (cropped & centered to hide all YT logos) */}
      <AnimatePresence>
        {showTrailer && trailerReady && resolvedVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
          >
            {/* Aspect-ratio cover scale container with cropping margins */}
            <div className="absolute w-[122%] h-[122%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-105 pointer-events-none">
              <div id={`youtube-hero-player-${movie.id}`} className="w-full h-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple overlapping cinematic gradients for readability & blending */}
      {/* Top darkening gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
      {/* Left side intense black/90 gradient to offset text */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/90 via-[#09090B]/60 to-transparent pointer-events-none z-10" />
      {/* Bottom strong blending gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent pointer-events-none z-10" />
      {/* Edge bleeding helper */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#09090B] to-transparent pointer-events-none z-10" />

      {/* Hero Content Panel (Lado Esquerdo) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 px-6 md:px-12 pb-16 md:pb-24 max-w-2xl flex flex-col items-start gap-4 select-none text-left"
        id="hero-content"
      >
        {/* original badge and visual chips */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-[#7C3AED]/25 text-[#A855F7] px-2.5 py-1 rounded border border-[#7C3AED]/40 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Original Astra
          </span>
          <span className="text-xs font-bold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded text-zinc-300 border border-white/5">
            4K Ultra HD
          </span>
          <span className="text-xs font-black border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded uppercase">
            {activeItem.ageRating}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          variants={itemVariants} 
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-none drop-shadow-2xl uppercase font-sans"
        >
          {activeItem.title}
        </motion.h1>

        {/* Info panel (Nota, Ano, Duração) */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 text-xs md:text-sm text-zinc-300 font-semibold">
          <span className="text-emerald-400 font-black">98% Match</span>
          <span>•</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-extrabold">{activeItem.rating}</span>
          </div>
          <span>•</span>
          <span>{activeItem.year}</span>
          <span>•</span>
          <span>{activeItem.duration}</span>
        </motion.div>

        {/* Narrative Description */}
        <motion.p 
          variants={itemVariants} 
          className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl text-left drop-shadow"
        >
          {activeItem.description}
        </motion.p>

        {/* Genres Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5">
          {displayGenres.map((g, idx) => (
            <span 
              key={idx} 
              className="text-xs font-bold text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded border border-zinc-900"
            >
              {g}
            </span>
          ))}
        </motion.div>

        {/* Action Buttons with high polish */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mt-4 w-full sm:w-auto">
          {/* Assistir Button (Roxo Principal) */}
          <button
            onClick={() => {
              if (!currentUser) {
                navigateTo('login');
              } else {
                const savedItem = historyCtx.history.find(h => h.movieId === activeItem.id);
                const playableItem = {
                  ...activeItem,
                  selectedSeason: savedItem?.season || 1,
                  selectedEpisode: savedItem?.episode || 1,
                };
                navigateTo('watch', playableItem);
              }
            }}
            className="flex items-center justify-center gap-2 bg-[#7C3AED] text-white hover:bg-[#6D28D9] font-black text-sm px-8 py-3.5 rounded shadow-lg shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/40 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer w-full sm:w-auto"
            id="hero-play-button"
          >
            <Play className="w-5 h-5 fill-current text-white" />
            <span>Assistir</span>
          </button>

          {/* More Info Button or Play Trailer on Mobile */}
          {isMobile ? (
            hasTrailer && !showTrailer ? (
              <button
                onClick={handleMobilePlayTrailer}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 hover:border-white/40 backdrop-blur-md border border-white/20 text-white font-bold text-sm px-8 py-3.5 rounded hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                id="hero-mobile-trailer-play"
              >
                <Play className="w-5 h-5 text-white" />
                <span>Assistir Trailer</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('details', activeItem)}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 hover:border-white/40 backdrop-blur-md border border-white/20 text-white font-bold text-sm px-8 py-3.5 rounded hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                id="hero-mobile-details"
              >
                <Info className="w-5 h-5 text-white" />
                <span>Mais Informações</span>
              </button>
            )
          ) : (
            <button
              onClick={() => navigateTo('details', activeItem)}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 hover:border-white/40 backdrop-blur-md border border-white/20 text-white font-bold text-sm px-8 py-3.5 rounded hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
              id="hero-info-button"
            >
              <Info className="w-5 h-5" />
              <span>Mais Informações</span>
            </button>
          )}

          {/* Favorite heart icon shortcut */}
          <button
            onClick={() => {
              if (!currentUser) {
                navigateTo('login');
              } else {
                toggleFavorite(activeItem);
              }
            }}
            className={`p-3.5 rounded border active:scale-95 transition-all duration-200 cursor-pointer hidden sm:block ${
              isInMyList 
                ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#A855F7]' 
                : 'bg-zinc-950/65 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title={isInMyList ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
            id="hero-favorite-button"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={isInMyList ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </motion.div>
      </motion.div>

      {/* Premium Floating Player Overlays & Controls (Bottom Right) */}
      <div className="absolute bottom-16 right-6 md:right-12 z-30 flex items-center gap-3">
        {/* Replay Button (Discreet & native looking) */}
        {showTrailer && trailerReady && isPlayerActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleReplay}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="Recomeçar Trailer"
            id="hero-replay-btn"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        )}

        {/* Audio Controller Button (Mute / Unmute) */}
        {showTrailer && trailerReady && isPlayerActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={toggleMute}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900 text-white backdrop-blur-md transition-all cursor-pointer"
            id="hero-sound-toggle-btn"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#A855F7] animate-pulse" />
            )}
          </motion.button>
        )}
      </div>

      {/* Elegant Discretized Premium Progress Bar Timeline */}
      {showTrailer && trailerReady && isPlayerActive && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/40 z-20 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
