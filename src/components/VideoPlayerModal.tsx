import React, { useEffect, useState } from 'react';
import { X, Tv, Sparkles, Loader2 } from 'lucide-react';
import { ContentItem } from '../types';
import { tmdbService } from '../services/tmdb';

interface VideoPlayerModalProps {
  movie: ContentItem;
  onClose: () => void;
}

export default function VideoPlayerModal({ movie, onClose }: VideoPlayerModalProps) {
  const [resolvedMovie, setResolvedMovie] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lock body scroll when player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch complete details including videos for this specific movie
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadTrailer() {
      try {
        const details = await tmdbService.getDetails(movie.id);
        if (isMounted) {
          setResolvedMovie(details);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn(`Failed to resolve rich trailer in theater modal for ${movie.id}:`, err);
        if (isMounted) {
          setResolvedMovie(movie); // fallback to original
          setIsLoading(false);
        }
      }
    }

    loadTrailer();

    return () => {
      isMounted = false;
    };
  }, [movie.id]);

  const activeItem = resolvedMovie || movie;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200"
      id="theater-modal-overlay"
    >
      {/* Background click close safeguard */}
      <div className="absolute inset-0 z-10" onClick={onClose} />

      {/* Main Theater container */}
      <div className="relative z-20 w-full max-w-5xl aspect-video bg-zinc-950 rounded-none md:rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/80 flex flex-col justify-between">
        
        {/* Floating Top Player Bar */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/95 via-black/40 to-transparent p-4 flex items-center justify-between z-30 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-[#7C3AED] text-white font-extrabold px-2.5 py-0.5 rounded tracking-widest uppercase animate-pulse">
              Em Exibição
            </span>
            <h3 className="text-white text-xs sm:text-sm font-bold truncate max-w-xs md:max-w-md">
              {activeItem.title} — Trailer Oficial
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/80 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
            title="Fechar Reprodução"
            id="theater-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Video Iframe Player / Loading Indicator */}
        <div className="relative w-full h-full flex-grow flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider">Conectando ao canal oficial...</p>
            </div>
          ) : (
            <iframe
              src={`${activeItem.trailerUrl}?autoplay=1&mute=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
              title={`${activeItem.title} Video Player`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Bottom player controls watermark */}
        <div className="bg-zinc-950/80 p-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 font-mono">0:00 / {activeItem.duration}</span>
            <div className="flex items-center gap-1.5 text-[#A855F7]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qualidade de Áudio Atmos 7.1 Ativa</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-zinc-400">
            <div className="flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" />
              <span>Transmitindo em 4K UHD</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
