import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import Hero from '../components/Hero';
import Carrossel from '../components/Carrossel';
import { HeroSkeleton, CarouselSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

export default function MoviesPage() {
  const { activeProfile } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [heroMovie, setHeroMovie] = useState<ContentItem | null>(null);
  const [popular, setPopular] = useState<ContentItem[]>([]);
  const [action, setAction] = useState<ContentItem[]>([]);
  const [scifi, setScifi] = useState<ContentItem[]>([]);
  const [horror, setHorror] = useState<ContentItem[]>([]);

  // Kids Filter Helper
  const filterKids = (items: ContentItem[]) => {
    if (activeProfile?.isKid) {
      return items.filter(
        (item) => item.ageRating === 'L' || item.ageRating === '12' || item.genres.includes('Animação') || item.genres.includes('Kids')
      );
    }
    return items;
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadMovies() {
      try {
        const [
          popularMovies,
          actionMovies,
          scifiMovies,
          horrorMovies
        ] = await Promise.all([
          tmdbService.getMoviesBySection('popular'),
          tmdbService.getMoviesBySection('action'),
          tmdbService.getMoviesBySection('scifi'),
          tmdbService.getMoviesBySection('horror')
        ]);

        if (!isMounted) return;

        // Select a stable hero or a high rating popular movie
        const filteredPopular = filterKids(popularMovies);
        if (filteredPopular.length > 0) {
          setHeroMovie(filteredPopular[0]);
        }

        setPopular(popularMovies);
        setAction(actionMovies);
        setScifi(scifiMovies);
        setHorror(horrorMovies);
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load movies page from TMDb:', err);
          setError('Erro ao carregar os filmes do TMDb. Verifique sua conexão.');
          setIsLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [activeProfile]);

  const finalPopular = useMemo(() => filterKids(popular), [popular, activeProfile]);
  const finalAction = useMemo(() => filterKids(action), [action, activeProfile]);
  const finalScifi = useMemo(() => filterKids(scifi), [scifi, activeProfile]);
  const finalHorror = useMemo(() => filterKids(horror), [horror, activeProfile]);

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <ErrorState 
          title="Erro ao Conectar" 
          message={error}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-grow pb-16 space-y-4" id="movies-page-container">
      {/* Featured Film Hero Banner */}
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        heroMovie && <Hero movie={heroMovie} />
      )}

      {/* Rows of Carousels */}
      <div className="space-y-4 -mt-16 md:-mt-24 relative z-20">
        
        {isLoading ? (
          <div className="space-y-8 pt-12">
            <CarouselSkeleton title="Filmes Populares" />
            <CarouselSkeleton title="Ação & Aventura Extrema" />
          </div>
        ) : (
          <>
            {/* Popular Movies Carousel */}
            {finalPopular.length > 0 && (
              <Carrossel title="Filmes Populares" movies={finalPopular} />
            )}

            {/* Action Movies Carousel */}
            {finalAction.length > 0 && (
              <Carrossel title="Ação & Aventura" movies={finalAction} />
            )}

            {/* Sci-Fi Movies Carousel */}
            {finalScifi.length > 0 && (
              <Carrossel title="Exploração Espacial & Sci-Fi" movies={finalScifi} />
            )}

            {/* Horror Movies Carousel */}
            {finalHorror.length > 0 && (
              <Carrossel title="Terror, Suspense & Mistério" movies={finalHorror} />
            )}
          </>
        )}

      </div>
    </div>
  );
}
