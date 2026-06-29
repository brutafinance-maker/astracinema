import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, HelpCircle, LogIn, User, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useRoute } from '../contexts/RouteContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { tmdbService } from '../services/tmdb';
import { ContentItem } from '../types';
import Hero from '../components/Hero';
import Carrossel from '../components/Carrossel';
import { HeroSkeleton, CarouselSkeleton } from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

export default function HomePage() {
  const { activeProfile } = useUser();
  const { navigateTo } = useRoute();
  const { history } = useHistory();
  const { currentUser } = useAuth();

  // Page States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [heroMovie, setHeroMovie] = useState<ContentItem | null>(null);
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [popular, setPopular] = useState<ContentItem[]>([]);
  const [topRated, setTopRated] = useState<ContentItem[]>([]);
  const [action, setAction] = useState<ContentItem[]>([]);
  const [horror, setHorror] = useState<ContentItem[]>([]);
  const [scifi, setScifi] = useState<ContentItem[]>([]);
  const [animation, setAnimation] = useState<ContentItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([]);

  // Kids Filter Helper
  const filterKids = (items: ContentItem[]) => {
    if (activeProfile?.isKid) {
      return items.filter(
        (item) => item.ageRating === 'L' || item.ageRating === '12' || item.genres.includes('Animação') || item.genres.includes('Kids')
      );
    }
    return items;
  };

  // Fetch all categories
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadData() {
      try {
        // Fetch all sections in parallel with caching
        const [
          trendingMovies,
          popularMovies,
          topRatedMovies,
          actionMovies,
          horrorMovies,
          scifiMovies,
          animationMovies
        ] = await Promise.all([
          tmdbService.getMoviesBySection('trending'),
          tmdbService.getMoviesBySection('popular'),
          tmdbService.getMoviesBySection('top_rated'),
          tmdbService.getMoviesBySection('action'),
          tmdbService.getMoviesBySection('horror'),
          tmdbService.getMoviesBySection('scifi'),
          tmdbService.getMoviesBySection('animation')
        ]);

        if (!isMounted) return;

        // Pick a random popular movie for the main Hero banner
        const filteredPopular = filterKids(popularMovies);
        if (filteredPopular.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(filteredPopular.length, 10));
          setHeroMovie(filteredPopular[randomIndex]);
        } else if (popularMovies.length > 0) {
          setHeroMovie(popularMovies[0]);
        }

        // Save sections
        setTrending(trendingMovies);
        setPopular(popularMovies);
        setTopRated(topRatedMovies);
        setAction(actionMovies);
        setHorror(horrorMovies);
        setScifi(scifiMovies);
        setAnimation(animationMovies);
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load homepage from TMDb:', err);
          setError('Não foi possível carregar o catálogo de filmes. Verifique sua conexão com a internet.');
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeProfile]);

  // Load details for "Continuar Assistindo" items from user history
  useEffect(() => {
    let isMounted = true;
    if (history.length === 0) {
      setContinueWatching([]);
      return;
    }

    async function loadHistoryDetails() {
      try {
        const items = await Promise.all(
          history.slice(0, 8).map(async (h) => {
            try {
              const details = await tmdbService.getDetails(h.movieId);
              return {
                ...details,
                continueWatchProgress: h.progress,
                selectedSeason: h.season,
                selectedEpisode: h.episode
              };
            } catch (err) {
              console.warn(`Could not load history details for ${h.movieId}`, err);
              return null;
            }
          })
        );

        if (isMounted) {
          setContinueWatching(items.filter((item): item is ContentItem => item !== null));
        }
      } catch (err) {
        console.error('Error loading history details:', err);
      }
    }

    loadHistoryDetails();

    return () => {
      isMounted = false;
    };
  }, [history]);

  // Filter sections dynamically based on Kids Profile
  const finalTrending = useMemo(() => filterKids(trending), [trending, activeProfile]);
  const finalPopular = useMemo(() => filterKids(popular), [popular, activeProfile]);
  const finalTopRated = useMemo(() => filterKids(topRated), [topRated, activeProfile]);
  const finalAction = useMemo(() => filterKids(action), [action, activeProfile]);
  const finalHorror = useMemo(() => filterKids(horror), [horror, activeProfile]);
  const finalScifi = useMemo(() => filterKids(scifi), [scifi, activeProfile]);
  const finalAnimation = useMemo(() => filterKids(animation), [animation, activeProfile]);

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <ErrorState 
          title="Erro ao Conectar à API" 
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
    <div className="flex-grow pb-16 space-y-4 animate-in fade-in duration-500" id="home-page-container">
      {/* Dynamic Personalized Header Greeting Banner (shown only for visitors to prompt sign-in) */}
      {!currentUser && (
        <div className="px-6 md:px-12 pt-6 pb-2" id="home-greeting-banner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-zinc-900/50 to-transparent border border-zinc-800/60 shadow-lg gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Olá, visitante!</p>
                <p className="text-xs text-zinc-400">Faça login para salvar seus favoritos, manter histórico e ver recomendações personalizadas.</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('login')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-bold text-xs shadow-lg shadow-[#7C3AED]/10 hover:shadow-[#7C3AED]/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              id="home-login-cta-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Featured Hero Banner */}
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        heroMovie && <Hero movie={heroMovie} />
      )}

      {/* Rows of carousels */}
      <div className="space-y-4 -mt-16 md:-mt-24 relative z-20">
        
        {isLoading ? (
          <div className="space-y-8 pt-12">
            <CarouselSkeleton title="Em Alta" />
            <CarouselSkeleton title="Populares" />
            <CarouselSkeleton title="Mais Bem Avaliados" />
          </div>
        ) : (
          <>
            {/* Continuar Assistindo Carousel */}
            {continueWatching.length > 0 && (
              <Carrossel title="Continuar Assistindo" movies={continueWatching} />
            )}

            {/* Em Alta (Trending) */}
            {finalTrending.length > 0 && (
              <Carrossel title="Em Alta" movies={finalTrending} />
            )}

            {/* Populares (Popular) */}
            {finalPopular.length > 0 && (
              <Carrossel title="Populares" movies={finalPopular} />
            )}

            {/* Mais Bem Avaliados (Top Rated) */}
            {finalTopRated.length > 0 && (
              <Carrossel title="Mais Bem Avaliados" movies={finalTopRated} />
            )}

            {/* Ação (Action) */}
            {finalAction.length > 0 && (
              <Carrossel title="Ação" movies={finalAction} />
            )}

            {/* Terror (Horror) */}
            {finalHorror.length > 0 && (
              <Carrossel title="Terror" movies={finalHorror} />
            )}

            {/* Ficção Científica (Sci-Fi) */}
            {finalScifi.length > 0 && (
              <Carrossel title="Ficção Científica" movies={finalScifi} />
            )}

            {/* Animação (Animation) */}
            {finalAnimation.length > 0 && (
              <Carrossel title="Animação" movies={finalAnimation} />
            )}
          </>
        )}

        {/* Premium Watermark details */}
        {activeProfile && !isLoading && (
          <div className="pt-12 pb-6 px-6 md:px-12 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity">
            <HelpCircle className="w-5 h-5 text-zinc-500 mb-2" />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Recomendações customizadas para {activeProfile.name}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
