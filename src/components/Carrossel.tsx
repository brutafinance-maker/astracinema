import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '../types';
import MovieCard from './MovieCard';

interface CarrosselProps {
  title: string;
  movies: ContentItem[];
  onCardClick?: (movie: ContentItem) => void;
  onPlayClick?: (movie: ContentItem) => void;
  onToggleMyList?: (movie: ContentItem) => void;
  myListIds?: string[];
}

export default function Carrossel({
  title,
  movies,
  onCardClick,
  onPlayClick,
  onToggleMyList,
  myListIds,
}: CarrosselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (movies.length === 0) {
    return null;
  }

  // Update arrow visibilities depending on scrolling progress
  const updateArrowVisibility = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const element = rowRef.current;
    if (element) {
      element.addEventListener('scroll', updateArrowVisibility);
      // Run once initially
      updateArrowVisibility();
      // Handle resize recalculation
      window.addEventListener('resize', updateArrowVisibility);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', updateArrowVisibility);
      }
      window.removeEventListener('resize', updateArrowVisibility);
    };
  }, [movies]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative space-y-2 md:space-y-3 px-4 md:px-12 py-4 group/row animate-in fade-in duration-300" id={`movie-row-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Row Header with elegant visual marker */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#7C3AED] to-[#A855F7]" />
          {title}
        </h2>
        <span className="text-[11px] font-semibold text-zinc-500 hover:text-[#A855F7] transition-colors cursor-pointer uppercase tracking-wider hidden sm:inline">
          Ver Tudo
        </span>
      </div>

      {/* Track container with relative overlay buttons */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 w-10 md:w-12 bg-gradient-to-r from-[#09090B] to-transparent text-white flex items-center justify-start pl-2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
            id={`scroll-left-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-950/80 border border-zinc-800 flex items-center justify-center hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:scale-105 transition-all duration-200">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 w-10 md:w-12 bg-gradient-to-l from-[#09090B] to-transparent text-white flex items-center justify-end pr-2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer"
            id={`scroll-right-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-950/80 border border-zinc-800 flex items-center justify-center hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:scale-105 transition-all duration-200">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        {/* Card Row Scroller */}
        <div
          ref={rowRef}
          onScroll={updateArrowVisibility}
          className="flex gap-4 overflow-x-auto py-2 px-1 scroll-smooth scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onCardClick={onCardClick}
              onPlayClick={onPlayClick}
              onToggleMyList={onToggleMyList}
              isInMyList={myListIds ? myListIds.includes(movie.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
