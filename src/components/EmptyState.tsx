import React from 'react';
import { Film } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  title,
  message,
  icon,
  actionText,
  onActionClick
}: EmptyStateProps) {
  return (
    <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto" id="astra-empty-state">
      <div className="w-16 h-16 rounded-full bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-zinc-500 mb-5">
        {icon || <Film className="w-8 h-8" />}
      </div>
      
      <h3 className="text-lg font-bold text-white tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mb-6">
        {message}
      </p>
      
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded hover:bg-zinc-200 transition-all duration-200 cursor-pointer"
          id="empty-action-button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
