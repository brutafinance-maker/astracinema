import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../contexts/RouteContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { currentUser, isLoading } = useAuth();
  const { navigateTo } = useRoute();

  useEffect(() => {
    if (!isLoading && currentUser) {
      navigateTo('home');
    }
  }, [currentUser, isLoading, navigateTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, we are redirecting so we shouldn't show children.
  if (currentUser) {
    return <div className="min-h-screen bg-[#09090B]" />;
  }

  return <>{children}</>;
}
