import React, { useState } from 'react';
import { Film, ChevronDown, User, Heart, Tv, LogOut, Sparkles } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRoute } from '../contexts/RouteContext';
import { useAuth } from '../contexts/AuthContext';
import { ViewType } from '../types';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { activeProfile, profiles, switchProfile } = useUser();
  const { myListIds } = useFavorites();
  const { currentView, navigateTo } = useRoute();
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewType) => {
    navigateTo(view);
    setIsMobileMenuOpen(false);
  };

  const myListCount = myListIds.length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 px-6 md:px-10 flex items-center justify-between z-50 bg-gradient-to-b from-[#09090B] via-[#09090B]/95 to-transparent backdrop-blur-md border-b border-white/5 transition-all duration-300 shrink-0" id="platform-navbar">
      {/* Left Section: Logo & Links */}
      <div className="flex items-center gap-8">
        {/* Brand Logo with Violet Gradient */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => handleNavClick('home')}
          id="nav-logo-container"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-white select-none">
            ASTRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]"> CINEMA</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentView === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
            id="nav-btn-home"
          >
            Início
            {currentView === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => handleNavClick('movies')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentView === 'movies' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
            id="nav-btn-movies"
          >
            Filmes
            {currentView === 'movies' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('series')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentView === 'series' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
            id="nav-btn-series"
          >
            Séries
            {currentView === 'series' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('mylist')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'mylist' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
            id="nav-btn-mylist"
          >
            Minha Lista
            {myListCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-full font-bold">
                {myListCount}
              </span>
            )}
            {currentView === 'mylist' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Right Section: Search & Profile Switcher */}
      <div className="flex items-center gap-4">
        {/* Modular Expandable Search Bar */}
        <SearchBar />

        {/* Favorite Icon shortcut */}
        <button 
          onClick={() => handleNavClick('mylist')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors relative cursor-pointer"
          title="Minha Lista"
          id="nav-favorite-shortcut"
        >
          <Heart className={`w-5 h-5 ${myListCount > 0 ? 'fill-[#7C3AED] text-[#7C3AED]' : ''}`} />
          {myListCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090B]" />
          )}
        </button>

        {/* User Profile Switcher Dropdown or Login Button */}
        {currentUser && activeProfile ? (
          <div className="relative" id="profile-switcher-wrapper">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 hover:bg-zinc-900 p-1 rounded-full transition-colors cursor-pointer"
              id="profile-dropdown-btn"
            >
              <img
                src={activeProfile.avatarUrl}
                alt={activeProfile.name}
                className="w-8 h-8 rounded object-cover ring-2 ring-[#7C3AED]/30"
              />
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Box */}
            {isProfileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-56 rounded-lg bg-[#0E0E11]/95 border border-zinc-800/80 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-zinc-800/60 mb-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Perfil Ativo</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      {activeProfile.name}
                      {activeProfile.isKid && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-1.5 py-0.2 rounded">Kids</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {profiles
                      .filter((p) => p.id !== activeProfile.id)
                      .map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => {
                            switchProfile(profile);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left text-xs cursor-pointer"
                        >
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="font-semibold">{profile.name}</span>
                          {profile.isKid && (
                            <span className="ml-auto text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-bold">Kids</span>
                          )}
                        </button>
                      ))}
                  </div>

                  <div className="border-t border-zinc-800/60 mt-2 pt-1">
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        alert('Gerenciamento de Perfis (Mockup)');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-left text-xs cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Gerenciar Perfis</span>
                    </button>
                    <button 
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await logout();
                        navigateTo('login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left text-xs cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigateTo('login')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-bold text-xs shadow-lg shadow-[#7C3AED]/10 hover:shadow-[#7C3AED]/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
            id="nav-entrar-btn"
          >
            Entrar
          </button>
        )}

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col justify-between w-6 h-5 cursor-pointer"
          id="mobile-menu-trigger"
        >
          <span className={`h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'w-full'}`} />
          <span className={`h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : 'w-full'}`} />
          <span className={`h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : 'w-full'}`} />
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#09090B] border-b border-zinc-900 px-6 py-6 flex flex-col gap-4 md:hidden z-40 shadow-2xl animate-in slide-in-from-top duration-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`text-left text-sm font-bold py-2 ${currentView === 'home' ? 'text-[#A855F7]' : 'text-zinc-400'}`}
          >
            Início
          </button>
          <button
            onClick={() => handleNavClick('movies')}
            className={`text-left text-sm font-bold py-2 ${currentView === 'movies' ? 'text-[#A855F7]' : 'text-zinc-400'}`}
          >
            Filmes
          </button>
          <button
            onClick={() => handleNavClick('series')}
            className={`text-left text-sm font-bold py-2 ${currentView === 'series' ? 'text-[#A855F7]' : 'text-zinc-400'}`}
          >
            Séries
          </button>
          <button
            onClick={() => handleNavClick('mylist')}
            className={`text-left text-sm font-bold py-2 flex items-center justify-between ${currentView === 'mylist' ? 'text-[#A855F7]' : 'text-zinc-400'}`}
          >
            <span>Minha Lista</span>
            {myListCount > 0 && (
              <span className="bg-[#7C3AED]/20 text-[#A855F7] px-2 py-0.5 rounded text-xs font-black">{myListCount}</span>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
