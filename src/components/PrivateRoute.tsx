import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../contexts/RouteContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, isLoading } = useAuth();
  const { navigateTo } = useRoute();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigateTo('login');
    }
  }, [currentUser, isLoading, navigateTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Return empty or temporary state while redirecting
    return <div className="min-h-screen bg-[#09090B]" />;
  }

  return <>{children}</>;
}
