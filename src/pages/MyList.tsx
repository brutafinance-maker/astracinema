import React, { useMemo, useEffect, useState } from 'react';
import { Heart, PlusCircle, Loader2 } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function MyListPage() {
  const { navigateTo, setPlayingMovie } = useRoute();
  const { myListIds, toggleFavorite } = useFavorites();
  const { activeProfile } = useUser();

  const [favoritedItems, setFavoritedItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load and resolve detailed items for all favorited IDs
  useEffect(() => {
    let isMounted = true;
    if (myListIds.length === 0) {
      setFavoritedItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    async function resolveFavorites() {
      try {
        const resolved = await Promise.all(
          myListIds.map(async (id) => {
            try {
              // Try to resolve using TMDb first (with cache-backed responses)
              return await tmdbService.getDetails(id);
            } catch (err) {
              console.warn(`Failed to resolve favorites info for TMDb item ${id}:`, err);
              return null;
            }
          })
        );

        if (isMounted) {
          // Filter out successfully resolved items
          setFavoritedItems(resolved.filter((item): item is ContentItem => item !== null));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error resolving favorites list details:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    resolveFavorites();

    return () => {
      isMounted = false;
    };
  }, [myListIds]);

  // Filter resolved favorites based on active profile (Kids vs Normal)
  const profileFilteredFavorites = useMemo(() => {
    if (activeProfile?.isKid) {
      return favoritedItems.filter(
        (item) => item.ageRating === 'L' || item.ageRating === '12' || item.genres.includes('Animação') || item.genres.includes('Kids')
      );
    }
    return favoritedItems;
  }, [favoritedItems, activeProfile]);

  return (
    <div className="px-6 md:px-12 py-12 max-w-7xl mx-auto space-y-8 flex-grow" id="mylist-page-container">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <Heart className="w-6 h-6 md:w-8 md:h-8 text-[#7C3AED] fill-[#7C3AED]" />
          <span>Minha Lista</span>
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm">
          Seus filmes e séries favoritos guardados em tempo real do TMDb.
        </p>
      </div>

      {/* Grid of Favorited Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: Math.max(myListIds.length, 5) }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : profileFilteredFavorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6" id="mylist-grid">
          {profileFilteredFavorites.map((movie) => (
            <div 
              key={movie.id}
              className="transform transition-transform duration-300 hover:scale-[1.02]"
            >
              <MovieCard
                movie={movie}
                onCardClick={(m) => navigateTo('details', m)}
                onPlayClick={setPlayingMovie}
                onToggleMyList={toggleFavorite}
                isInMyList={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sua lista está vazia"
          message="Navegue pelas recomendações na página inicial para adicionar seus filmes e séries favoritos à sua lista."
          icon={<PlusCircle className="w-8 h-8 text-zinc-600" />}
          actionText="Descobrir Conteúdo"
          onActionClick={() => navigateTo('home')}
        />
      )}
    </div>
  );
}
