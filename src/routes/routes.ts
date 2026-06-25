import { ViewType } from '../types';

export interface RouteConfig {
  path: ViewType;
  label: string;
  isNavigation: boolean;
}

export const ROUTES: RouteConfig[] = [
  {
    path: 'home',
    label: 'Início',
    isNavigation: true
  },
  {
    path: 'movies',
    label: 'Filmes',
    isNavigation: true
  },
  {
    path: 'series',
    label: 'Séries',
    isNavigation: true
  },
  {
    path: 'mylist',
    label: 'Minha Lista',
    isNavigation: true
  },
  {
    path: 'search',
    label: 'Busca',
    isNavigation: false
  },
  {
    path: 'details',
    label: 'Detalhes',
    isNavigation: false
  }
];
