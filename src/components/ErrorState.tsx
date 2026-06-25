import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = 'Ocorreu um erro', 
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="w-full min-h-[350px] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto" id="astra-error-state">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mb-4 animate-bounce">
        <AlertCircle className="w-7 h-7" />
      </div>
      
      <h3 className="text-lg font-bold text-white tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-[#7C3AED] hover:text-white hover:bg-[#7C3AED]/10 text-zinc-300 font-semibold text-sm px-5 py-2.5 rounded transition-all duration-200 cursor-pointer"
          id="error-retry-button"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  );
}
