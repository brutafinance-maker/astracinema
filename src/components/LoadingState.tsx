import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ message = 'Carregando...', fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center gap-4'
    : 'w-full min-h-[300px] flex flex-col items-center justify-center gap-4 py-12';

  return (
    <div className={containerClasses} id="astra-loading-state">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="absolute w-14 h-14 rounded-full border-2 border-t-[#7C3AED] border-r-transparent border-l-transparent border-b-zinc-800 animate-spin" />
        {/* Animated inner loader */}
        <Loader2 className="w-6 h-6 text-[#A855F7] animate-spin" />
      </div>
      
      <p className="text-sm font-semibold tracking-wide text-zinc-400 select-none animate-pulse">
        {message}
      </p>
    </div>
  );
}
