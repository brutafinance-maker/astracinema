import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import Hero from '../components/Hero';
import Carrossel from '../components/Carrossel';
import { HeroSkeleton, CarouselSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

export default function SeriesPage() {
  const { activeProfile } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [heroSeries, setHeroSeries] = useState<ContentItem | null>(null);
  const [popular, setPopular] = useState<ContentItem[]>([]);
  const [drama, setDrama] = useState<ContentItem[]>([]);
  const [animation, setAnimation] = useState<ContentItem[]>([]);
  const [scifi, setScifi] = useState<ContentItem[]>([]);

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

    async function loadSeries() {
      try {
        const [
          popularSeries,
          dramaSeries,
          animationSeries,
          scifiSeries
        ] = await Promise.all([
          tmdbService.getSeriesBySection('popular'),
          tmdbService.getSeriesBySection('drama'),
          tmdbService.getSeriesBySection('animation'),
          tmdbService.getSeriesBySection('scifi')
        ]);

        if (!isMounted) return;

        // Select a stable hero series
        const filteredPopular = filterKids(popularSeries);
        if (filteredPopular.length > 0) {
          setHeroSeries(filteredPopular[0]);
        }

        setPopular(popularSeries);
        setDrama(dramaSeries);
        setAnimation(animationSeries);
        setScifi(scifiSeries);
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load series page from TMDb:', err);
          setError('Erro ao carregar as séries do TMDb. Verifique sua conexão.');
          setIsLoading(false);
        }
      }
    }

    loadSeries();

    return () => {
      isMounted = false;
    };
  }, [activeProfile]);

  const finalPopular = useMemo(() => filterKids(popular), [popular, activeProfile]);
  const finalDrama = useMemo(() => filterKids(drama), [drama, activeProfile]);
  const finalAnimation = useMemo(() => filterKids(animation), [animation, activeProfile]);
  const finalScifi = useMemo(() => filterKids(scifi), [scifi, activeProfile]);

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
    <div className="flex-grow pb-16 space-y-4" id="series-page-container">
      {/* Featured Series Hero Banner */}
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        heroSeries && <Hero movie={heroSeries} />
      )}

      {/* Rows of Carousels */}
      <div className="space-y-4 -mt-16 md:-mt-24 relative z-20">
        
        {isLoading ? (
          <div className="space-y-8 pt-12">
            <CarouselSkeleton title="Séries em Destaque" />
            <CarouselSkeleton title="Séries de Drama & Mistério" />
          </div>
        ) : (
          <>
            {/* Popular Series Carousel */}
            {finalPopular.length > 0 && (
              <Carrossel title="Séries em Destaque" movies={finalPopular} />
            )}

            {/* Drama & Suspense Carousel */}
            {finalDrama.length > 0 && (
              <Carrossel title="Séries de Drama & Mistério" movies={finalDrama} />
            )}

            {/* Anime Series Carousel */}
            {finalAnimation.length > 0 && (
              <Carrossel title="Anime & Animações" movies={finalAnimation} />
            )}

            {/* Sci-Fi & Fantasy Series Carousel */}
            {finalScifi.length > 0 && (
              <Carrossel title="Ficção Científica & Fantasia" movies={finalScifi} />
            )}
          </>
        )}

      </div>
    </div>
  );
}
