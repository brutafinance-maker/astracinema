import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize, Loader2, Film, AlertTriangle, ChevronRight, ChevronLeft, Tv, Settings, Info, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';
import { useHistory } from '../contexts/HistoryContext';
import { ContentItem } from '../types';
import { FROM_EPISODES } from '../data/fromEpisodes';

// Standard high-quality open source streaming MP4 for premium demonstration
const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4";

export default function WatchPage() {
  const { selectedMovie: movie, handleBack } = useRoute();
  const historyCtx = useHistory();

  // If no movie is selected, fallback gracefully
  if (!movie) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white z-50">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black uppercase tracking-wider">Nenhum conteúdo selecionado</h2>
          <button onClick={handleBack} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // State Management
  const [useDemo, setUseDemo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);

  // Series Specific States (Structure)
  const [activeSeason, setActiveSeason] = useState(movie.selectedSeason || 1);
  const [activeEpisode, setActiveEpisode] = useState(movie.selectedEpisode || 1);
  const [episodesList, setEpisodesList] = useState<any[]>([]);

  // Find current episode object if it's a TV series and has custom metadata
  const currentEpisodeObj = React.useMemo(() => {
    if (movie.category !== 'series') return null;
    const isFromSeries = movie.title.toLowerCase().includes('from') || movie.title.toLowerCase().includes('origem') || movie.id.includes('124116');
    if (isFromSeries) {
      return FROM_EPISODES.find((ep) => ep.season === activeSeason && ep.episode === activeEpisode) || null;
    }
    return null;
  }, [movie, activeSeason, activeEpisode]);

  const activeGdriveId = movie.gdriveId || (currentEpisodeObj?.provider === 'gdrive' ? currentEpisodeObj.fileId : undefined);
  const currentEmbedUrl = (currentEpisodeObj?.provider !== 'gdrive' && currentEpisodeObj?.videoUrl) ? currentEpisodeObj.videoUrl : '';

  // Google Drive Stream Modes
  const [gdriveMode, setGdriveMode] = useState<'checking' | 'direct' | 'embed'>(activeGdriveId ? 'checking' : (currentEmbedUrl ? 'embed' : 'direct'));

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Video Url lookup
  const directStreamUrl = activeGdriveId ? `https://drive.google.com/uc?id=${activeGdriveId}&export=download` : '';
  const embedPreviewUrl = activeGdriveId ? `https://drive.google.com/file/d/${activeGdriveId}/preview` : (currentEmbedUrl || '');
  const videoUrl = useDemo ? DEMO_VIDEO_URL : (activeGdriveId ? directStreamUrl : (currentEmbedUrl ? '' : (movie.videoUrl || '')));

  // For custom embed, handle loading state transitions
  useEffect(() => {
    if (currentEmbedUrl) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentEmbedUrl]);

  const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0];

  // Try direct streaming, if it fails within 2.5 seconds, fallback to embed
  useEffect(() => {
    if (!activeGdriveId) {
      setGdriveMode(currentEmbedUrl ? 'embed' : 'direct');
      return;
    }

    setGdriveMode('checking');
    setIsLoading(true);
    setPlaybackError(false);

    const fallbackTimeout = setTimeout(() => {
      setGdriveMode((current) => {
        if (current === 'checking') {
          console.log('Direct stream check timed out, switching to secure Google Drive Embed mode.');
          setIsLoading(false);
          return 'embed';
        }
        return current;
      });
    }, 2500);

    return () => clearTimeout(fallbackTimeout);
  }, [activeGdriveId, currentEmbedUrl]);

  // Setup seasons / episodes list
  useEffect(() => {
    if (movie.category === 'series') {
      const isFromSeries = movie.title.toLowerCase().includes('from') || movie.title.toLowerCase().includes('origem') || movie.id.includes('124116');
      if (isFromSeries) {
        const eps = FROM_EPISODES.filter((ep) => ep.season === activeSeason).map((ep) => ({
          id: `ep-${ep.episode}`,
          number: ep.episode,
          title: ep.title,
          description: ep.description,
          duration: '45 min',
          rating: ep.rating,
          airDate: ep.airDate,
          thumbnailUrl: movie.bannerUrl || ep.thumbnailUrl
        }));
        setEpisodesList(eps);
      } else {
        const firstSeason = movie.seasons?.find((s: any) => s.season_number === activeSeason) || movie.seasons?.[0];
        const count = firstSeason?.episode_count || movie.episodesCount || 10;
        
        const eps = Array.from({ length: count }, (_, idx) => ({
          id: `ep-${idx + 1}`,
          number: idx + 1,
          title: `Episódio ${idx + 1}`,
          description: `Descrição em alta definição do episódio ${idx + 1} da série ${movie.title}.`,
          duration: '45 min',
          thumbnailUrl: movie.bannerUrl
        }));
        setEpisodesList(eps);
      }
    }
  }, [movie, activeSeason]);

  // Force automatic fullscreen/widescreen mode on mount
  useEffect(() => {
    const enterFullscreenOnMount = async () => {
      // Let the player render and settle
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (!playerContainerRef.current) return;
      
      try {
        if (!document.fullscreenElement) {
          await playerContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn(
          'Automatic fullscreen request on load was blocked by browser security policy. This is normal and expected inside developer console previews or without preceding clicks. Fullscreen can be requested via the button.',
          err
        );
      }
    };
    
    enterFullscreenOnMount();
  }, [movie.id]);



  // Core Player Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback blocked or failed', e);
      });
    }
  };

  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
    }
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const percentage = parseFloat(e.target.value);
      const newTime = (percentage / 100) * (videoRef.current.duration || 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
    if (newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    setIsSpeedDropdownOpen(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen to external fullscreen changes (e.g. Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Video Events
  const handleCanPlay = () => {
    if (activeGdriveId && gdriveMode === 'checking') {
      setGdriveMode('direct');
      setIsLoading(false);
      console.log('Direct HTML5 streaming available for Google Drive video.');
    }
  };

  const handleVideoError = () => {
    if (activeGdriveId && (gdriveMode === 'checking' || gdriveMode === 'direct')) {
      console.log('Direct stream error, switching to secure Google Drive Embed mode.');
      setGdriveMode('embed');
      setIsLoading(false);
    } else {
      setPlaybackError(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      
      // Auto seek to last watched position
      const savedPercent = historyCtx.getMovieProgress(movie.id);
      if (savedPercent > 0 && savedPercent < 95) {
        const targetTime = (savedPercent / 100) * videoRef.current.duration;
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
      
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // Save progress dynamically in state and history context
      const percent = Math.floor((current / (videoRef.current.duration || 1)) * 100);
      if (percent % 5 === 0) {
        historyCtx.addToHistory(movie.id, percent);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    historyCtx.addToHistory(movie.id, 100);
    if (movie.category === 'series') {
      handleNextEpisode();
    }
  };

  // Episode Swapping Controls
  const handleNextEpisode = () => {
    if (activeEpisode < episodesList.length) {
      setIsLoading(true);
      setActiveEpisode(prev => prev + 1);
      setCurrentTime(0);
      setIsPlaying(false);
      
      // Simulating loading next stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          });
        }
        setIsLoading(false);
      }, 1000);
    }
  };

  const handlePrevEpisode = () => {
    if (activeEpisode > 1) {
      setIsLoading(true);
      setActiveEpisode(prev => prev - 1);
      setCurrentTime(0);
      setIsPlaying(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          });
        }
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleEpisodeSelect = (epNum: number) => {
    setIsLoading(true);
    setActiveEpisode(epNum);
    setCurrentTime(0);
    setIsPlaying(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Stable Activity Detector to hide/show controls like Netflix
  const handleActivity = React.useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 4 seconds of inactivity
    controlsTimeoutRef.current = setTimeout(() => {
      const isActuallyPlaying = currentEmbedUrl || gdriveMode === 'embed' || isPlaying;
      if (isActuallyPlaying) {
        setShowControls(false);
      }
    }, 4000);
  }, [isPlaying, gdriveMode, currentEmbedUrl]);

  // Keyboard shortcut events and TV Remote Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger activity overlay on any key press
      handleActivity();

      // Backspace or Escape to go back
      if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        handleBack();
        return;
      }

      if (gdriveMode === 'embed' || currentEmbedUrl) {
        // Keyboard/TV Navigation for Embed Player Mode (e.g. Next/Prev Episode)
        if (movie.category === 'series') {
          if (e.key === 'PageDown' || e.code === 'KeyN') {
            e.preventDefault();
            handleNextEpisode();
          } else if (e.key === 'PageUp' || e.code === 'KeyP') {
            e.preventDefault();
            handlePrevEpisode();
          }
        }
        return;
      }
      
      if (!videoRef.current || !videoUrl) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoUrl, isPlaying, isMuted, volume, gdriveMode, currentEmbedUrl, activeEpisode, episodesList, handleActivity, handleBack, handleNextEpisode, handlePrevEpisode, togglePlay, seekForward, seekBackward, toggleFullscreen, toggleMute]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render Fallback if no video URL, gdrive ID, and no custom embed URL is provided
  if (!videoUrl && !activeGdriveId && !currentEmbedUrl) {
    return (
      <div className="fixed inset-0 bg-[#09090B] flex flex-col justify-between p-6 md:p-12 text-white z-50 overflow-y-auto selection:bg-[#7C3AED]/30">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <span>ID: {movie.id}</span>
          </div>
        </div>

        {/* Central Content Card */}
        <div className="max-w-xl mx-auto text-center space-y-8 my-12 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#A855F7] shadow-xl shadow-[#7C3AED]/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Film className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono">
              Indisponível no momento
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              {movie.title}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Este conteúdo de reprodução ainda não foi vinculado ao nosso servidor oficial. Deseja visualizar o reprodutor profissional utilizando nosso feed de testes?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => setUseDemo(true)}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm px-6 py-4 rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all hover:scale-102 cursor-pointer"
              id="watch-start-demo-btn"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Entrar no Player (Demo)</span>
            </button>
            <button
              onClick={handleBack}
              className="w-full sm:flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-sm px-6 py-4 rounded-xl transition-all hover:scale-102 cursor-pointer"
            >
              Voltar aos detalhes
            </button>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="text-center text-[11px] text-zinc-600 font-medium">
          Astra Cinema Platform — Suporte HLS / MP4 e Dash Integrados
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={playerContainerRef}
      onMouseMove={handleActivity}
      onFocus={handleActivity}
      onClick={handleActivity}
      className="fixed inset-0 w-full h-full bg-black z-50 select-none overflow-hidden flex flex-col justify-between"
      id={`astra-theater-player-${movie.id}`}
    >
      {/* Hidden tester element if checking Google Drive direct playability */}
      {activeGdriveId && gdriveMode === 'checking' && (
        <video 
          ref={videoRef}
          src={directStreamUrl}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
          className="absolute w-1 h-1 opacity-0 pointer-events-none"
          muted
          autoPlay
        />
      )}

      {/* Mode 1: Custom HTML5 Video Player */}
      {gdriveMode === 'direct' && !currentEmbedUrl && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain z-10"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onError={handleVideoError}
            autoPlay
            playsInline
          />
          
          {/* Black ambient overlay that darkens the player background */}
          <div className="absolute inset-0 bg-[#000000]/25 pointer-events-none z-15" />
        </>
      )}

      {/* Mode 2: Google Drive Embed Frame */}
      {activeGdriveId && gdriveMode === 'embed' && (
        <div className="absolute inset-0 w-full h-full z-10 bg-black overflow-hidden">
          <iframe
            src={embedPreviewUrl}
            className="absolute w-full border-none"
            style={{
              top: '-56px',
              height: 'calc(100% + 56px)',
            }}
            allow="autoplay; fullscreen; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-forms"
            id="gdrive-embed-iframe"
          />
        </div>
      )}

      {/* Mode 3: Custom Episode Embed Frame (e.g. Dailymotion for FROM episodes) */}
      {currentEmbedUrl && (
        <div className="absolute inset-0 w-full h-full z-10 bg-black overflow-hidden">
          <iframe
            src={currentEmbedUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; fullscreen; picture-in-picture"
            id="custom-embed-iframe"
          />
        </div>
      )}

      {/* Central Loading Indicator (Overlay) */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 transition-all duration-300">
          <Loader2 className="w-12 h-12 text-[#A855F7] animate-spin" />
          <div className="text-center space-y-1.5 mt-4">
            <p className="text-sm font-extrabold uppercase tracking-widest text-white">Bufferizando em alta definição</p>
            <p className="text-xs text-zinc-500 font-medium">Sincronizando áudio Atmos e conexões de alta velocidade...</p>
          </div>
        </div>
      )}

      {/* Playback Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090B] z-40 p-6">
          <AlertTriangle className="w-14 h-14 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Falha no fluxo de reprodução</h2>
          <p className="text-zinc-400 text-sm text-center max-w-md mt-2">
            Não foi possível carregar a transmissão segura para este título. Por favor, verifique sua conexão ou tente novamente mais tarde.
          </p>
          <button
            onClick={() => {
              setPlaybackError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play();
              }
            }}
            className="mt-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Top Header Controls overlay (Shown for all modes to maintain a premium uniform look) */}
      <div 
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-6 md:p-8 flex items-start justify-between z-30 transition-all duration-500 pointer-events-none ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Left Side: Info */}
        <div className="flex items-start gap-4 pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
            title="Voltar aos Detalhes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-[#7C3AED] text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {movie.category === 'movie' ? 'Filme' : 'Episódio'}
              </span>
              {movie.category === 'series' && (
                <span className="text-[10px] text-[#A855F7] font-bold">
                  Temporada {activeSeason} • Episódio {activeEpisode}
                </span>
              )}
              {activeGdriveId && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Cinema Cloud
                </span>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-black text-white leading-none tracking-tight uppercase">
              {movie.title}
              {movie.category === 'series' && ` — Ep. ${activeEpisode}`}
            </h1>
          </div>
        </div>

        {/* Right Side: Active Stream Specs & Episode Navigation */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pointer-events-auto">
          {/* Active Stream Specs */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-850 px-3 py-1.5 rounded-full backdrop-blur-md font-mono text-[10px] md:text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#A855F7] font-bold">4K ULTRA HD</span>
            <span>•</span>
            <span>HDR10+</span>
            <span>•</span>
            <span>Atmos 7.1</span>
          </div>

          {/* Episode Navigation (Only for Series) */}
          {movie.category === 'series' && episodesList.length > 0 && (
            <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 p-1 rounded-xl backdrop-blur-md shadow-2xl">
              <button
                onClick={handlePrevEpisode}
                disabled={activeEpisode <= 1}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all border cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110 ${
                  activeEpisode <= 1
                    ? 'border-zinc-900 text-zinc-700 bg-zinc-950/40 pointer-events-none'
                    : 'border-zinc-850 text-zinc-300 bg-zinc-900 hover:bg-zinc-850 hover:text-white'
                }`}
                title="Episódio Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-mono font-black text-white px-2.5 py-1 bg-zinc-900/50 border border-zinc-850/50 rounded">
                EP {activeEpisode} / {episodesList.length}
              </span>

              <button
                onClick={handleNextEpisode}
                disabled={activeEpisode >= episodesList.length}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all border cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110 ${
                  activeEpisode >= episodesList.length
                    ? 'border-zinc-900 text-zinc-700 bg-zinc-950/40 pointer-events-none'
                    : 'border-[#7C3AED]/40 text-purple-300 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 hover:text-white'
                }`}
                title="Próximo Episódio"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Panel overlay (Custom Controls rendered in direct Mode and not custom embed) */}
      {gdriveMode === 'direct' && !currentEmbedUrl && (
        <div 
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 md:p-8 flex flex-col gap-4 z-30 transition-all duration-500 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          id="player-bottom-controls"
        >
          {/* Timeline Progress Bar Row */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-400 w-12 text-left">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-grow relative flex items-center group/timeline">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercent}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#7C3AED] group-hover/timeline:h-2 transition-all outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED]"
              />
              <div 
                className="absolute h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full pointer-events-none" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-xs font-mono text-zinc-400 w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Media Buttons Controls */}
          <div className="flex items-center justify-between">
            
            {/* Left Block: Playback, Rewind, FastForward, Volume */}
            <div className="flex items-center gap-4">
              
              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                title={isPlaying ? "Pausar (Espaço)" : "Reproduzir (Espaço)"}
                id="player-play-toggle"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current text-black" />
                ) : (
                  <Play className="w-5 h-5 fill-current text-black ml-0.5" />
                )}
              </button>

              {/* Seek Back 10s */}
              <button
                onClick={seekBackward}
                className="w-10 h-10 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-850 flex items-center justify-center active:scale-90 transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                title="Voltar 10s (Seta Esquerda)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Seek Forward 10s */}
              <button
                onClick={seekForward}
                className="w-10 h-10 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-850 flex items-center justify-center active:scale-90 transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                title="Avançar 10s (Seta Direita)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <span className="h-6 w-[1px] bg-zinc-800 mx-1" />

              {/* Volume Control */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                  title={isMuted ? "Ativar Áudio (M)" : "Silenciar (M)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 focus-visible:w-20 h-1 rounded-full accent-[#7C3AED] transition-all duration-300 cursor-pointer opacity-0 group-hover/volume:opacity-100 focus-visible:opacity-100 bg-zinc-800 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                />
              </div>
            </div>

            {/* Right Block: Aspect ratio, Info & Fullscreen */}
            <div className="flex items-center gap-3">
              {/* Playback Speed Selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)}
                  className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                >
                  <span>{playbackSpeed}x</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isSpeedDropdownOpen && (
                  <div className="absolute bottom-14 right-0 w-24 bg-zinc-950 border border-zinc-850 rounded-xl p-1 shadow-xl z-50 flex flex-col gap-0.5">
                    {speedOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSpeedSelect(opt)}
                        className={`text-left text-[11px] font-bold p-2 rounded-lg flex items-center justify-between hover:bg-zinc-900 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                          playbackSpeed === opt ? 'text-[#A855F7]' : 'text-zinc-400'
                        }`}
                      >
                        <span>{opt}x</span>
                        {playbackSpeed === opt && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED] focus-visible:scale-110"
                title="Tela Cheia (F)"
                id="player-fullscreen-toggle"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
}
