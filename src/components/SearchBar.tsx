import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRoute } from '../contexts/RouteContext';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, currentView, navigateTo } = useRoute();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo('search');
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 bg-zinc-900/80 border transition-all duration-300 rounded px-3 py-1.5 ${
        isExpanded || searchQuery 
          ? 'w-48 sm:w-64 border-[#7C3AED]/50 ring-1 ring-[#7C3AED]/20' 
          : 'w-10 md:w-40 border-transparent bg-transparent'
      }`}
      id="independent-search-bar"
    >
      <Search 
        className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-white transition-colors flex-shrink-0" 
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (currentView !== 'search') {
            navigateTo('search');
          }
        }}
      />
      <input
        type="text"
        placeholder="Títulos, gêneros..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (currentView !== 'search') {
            navigateTo('search');
          }
        }}
        onKeyDown={handleKeyPress}
        onFocus={() => {
          setIsExpanded(true);
          if (currentView !== 'search') {
            navigateTo('search');
          }
        }}
        onBlur={() => {
          if (!searchQuery) {
            setIsExpanded(false);
          }
        }}
        className={`bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full transition-opacity duration-200 ${
          isExpanded || searchQuery ? 'opacity-100' : 'opacity-0 md:opacity-100 md:block hidden'
        }`}
        id="independent-search-input"
      />
    </div>
  );
}
