import { useRoute } from '../contexts/RouteContext';
import { ViewType, ContentItem } from '../types';

export function useNavigation() {
  const { currentView, selectedMovie, navigateTo, handleBack, historyViews } = useRoute();

  return {
    currentView,
    selectedMovie,
    history: historyViews,
    navigateTo,
    goBack: handleBack,
    isHome: currentView === 'home',
    isMovies: currentView === 'movies',
    isSeries: currentView === 'series',
    isMyList: currentView === 'mylist',
    isSearch: currentView === 'search',
    isDetails: currentView === 'details'
  };
}
