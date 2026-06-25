import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertTriangle, ArrowLeft, Settings, ChevronDown, Check, Sparkles } from 'lucide-react';

interface GoogleDrivePlayerProps {
  fileId: string;
  title?: string;
  onBack?: () => void;
}

type PlayerMode = 'checking' | 'direct' | 'embed' | 'error';

export default function GoogleDrivePlayer({ fileId, title = 'Teste de Reprodução', onBack }: GoogleDrivePlayerProps) {
  const [mode, setMode] = useState<PlayerMode>('checking');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate Google Drive Stream & Preview URLs
  const directStreamUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
  const embedPreviewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  // Speed options
  const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0];

  // Try direct streaming, if it fails within 2.5 seconds or triggers error, fallback to embed
  useEffect(() => {
    setMode('checking');
    setIsLoading(true);

    const fallbackTimeout = setTimeout(() => {
      // If still checking after 2.5s, switch to embed
      setMode((current) => {
        if (current === 'checking') {
          console.log('Direct stream check timed out, switching to secure Google Drive Embed mode.');
          setIsLoading(false);
          return 'embed';
        }
        return current;
      });
    }, 2500);

    return () => clearTimeout(fallbackTimeout);
  }, [fileId]);

  // Handle keyboard controls in direct mode
  useEffect(() => {
    if (mode !== 'direct') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
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
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isPlaying, volume, isMuted]);

  // Hide controls dynamically on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && mode === 'direct') {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, mode]);

  // Core Video Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Direct stream play failed:', err);
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
      const percent = parseFloat(e.target.value);
      const newTime = (percent / 100) * (videoRef.current.duration || 0);
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
    setIsMuted(newVol === 0);
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
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  // Video Tag callbacks
  const handleCanPlay = () => {
    if (mode === 'checking') {
      setMode('direct');
      setIsLoading(false);
      console.log('Direct HTML5 streaming available for Google Drive video.');
    }
  };

  const handleVideoError = () => {
    if (mode === 'checking' || mode === 'direct') {
      console.log('Direct stream error, switching to secure Google Drive Embed mode.');
      setMode('embed');
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[75vh] md:h-[82vh] bg-black rounded-2xl overflow-hidden border border-zinc-850 shadow-2xl shadow-black select-none flex flex-col justify-between"
      id="gdrive-player-container"
    >
      {/* Hidden tester element if checking */}
      {mode === 'checking' && (
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
      {mode === 'direct' && (
        <>
          <video
            ref={videoRef}
            src={directStreamUrl}
            className="absolute inset-0 w-full h-full object-contain z-10"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onError={handleVideoError}
            autoPlay
            playsInline
          />
          
          {/* Black ambient screen tint */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-15" />
        </>
      )}

      {/* Mode 2: Bulletproof Google Drive Embed Frame */}
      {mode === 'embed' && (
        <div className="absolute inset-0 w-full h-full z-10 bg-black">
          <iframe
            src={embedPreviewUrl}
            className="w-full h-full border-none"
            allow="autoplay; fullscreen; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            id="gdrive-embed-iframe"
          />
        </div>
      )}

      {/* Premium Custom Overlay Controls (Visible only in Direct Mode or as general frame styling) */}
      <div 
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/95 via-black/75 to-transparent p-4 md:p-6 flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-white flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
              title="Voltar"
              id="gdrive-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-[#7C3AED] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Drive Cloud
              </span>
              <span className="text-[10px] text-zinc-400 font-bold font-mono">
                Estilo Netflix
              </span>
            </div>
            <h3 className="text-white text-xs sm:text-sm font-bold truncate max-w-xs md:max-w-md">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'embed' ? (
            <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full px-3 py-1 text-[10px] md:text-xs text-[#A855F7] font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Transmissão Integrada Cloud Ativa</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full px-3 py-1 text-[10px] md:text-xs text-[#A855F7] font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Controles Customizados Ultra</span>
            </div>
          )}
        </div>
      </div>

      {/* Mid Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-40 transition-all">
          <Loader2 className="w-10 h-10 text-[#A855F7] animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Carregando feed de alta velocidade...</p>
          <p className="text-[10px] text-zinc-500 mt-1">Conectando ao Google Drive CDN</p>
        </div>
      )}

      {/* Bottom controls overlay (Only displayed in Custom HTML5 Player Mode) */}
      {mode === 'direct' && (
        <div 
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 md:p-6 flex flex-col gap-3.5 z-30 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          id="gdrive-bottom-controls"
        >
          {/* Seeker slider timeline */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 w-10 text-left">
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
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#7C3AED] hover:h-1.5 transition-all outline-none"
              />
              <div 
                className="absolute h-1 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full pointer-events-none" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-400 w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons strip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <Pause className="w-4.5 h-4.5 fill-current text-black" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-current text-black ml-0.5" />
                )}
              </button>

              {/* Seek Back 10s */}
              <button
                onClick={seekBackward}
                className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 flex items-center justify-center transition-all cursor-pointer"
                title="Voltar 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Seek Forward 10s */}
              <button
                onClick={seekForward}
                className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 flex items-center justify-center transition-all cursor-pointer"
                title="Avançar 10s"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <span className="h-5 w-[1px] bg-zinc-800 mx-1" />

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 group/volume">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-full hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer"
                  title={isMuted ? "Ativar som" : "Mutar"}
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
                  className="w-0 group-hover/volume:w-16 focus:w-16 h-1 rounded-full accent-[#7C3AED] transition-all bg-zinc-800 appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Right block: Speed selector & fullscreen */}
            <div className="flex items-center gap-2">
              {/* Speed Dropdown Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)}
                  className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{playbackSpeed}x</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isSpeedDropdownOpen && (
                  <div className="absolute bottom-10 right-0 w-24 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-xl z-50 flex flex-col gap-0.5">
                    {speedOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSpeedSelect(opt)}
                        className={`text-left text-[11px] font-bold p-1.5 rounded-lg flex items-center justify-between hover:bg-zinc-900 cursor-pointer ${
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

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer"
                title="Tela Cheia"
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

      {/* Mode 2 styling overlay (Displays some premium indications when embedding) */}
      {mode === 'embed' && (
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-black/80 border border-zinc-850 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] text-zinc-400 font-semibold shadow-xl">
          <span>Como assistir: Use os controles nativos do reprodutor acima para reproduzir, pausar ou alterar o volume.</span>
        </div>
      )}
    </div>
  );
}
