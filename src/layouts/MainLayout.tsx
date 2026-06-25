import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUser } from '../contexts/UserContext';
import { useRoute } from '../contexts/RouteContext';
import LoadingState from '../components/LoadingState';
import VideoPlayerModal from '../components/VideoPlayerModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isLoading: isProfileLoading } = useUser();
  const { playingMovie, setPlayingMovie } = useRoute();

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-[#7C3AED]/30 selection:text-white" id="astra-main-layout">
      {/* Universal Sticky Header */}
      <Navbar />

      {/* Profile Switching Global Loader Transition Overlay */}
      {isProfileLoading ? (
        <div className="fixed inset-0 bg-[#09090B]/90 backdrop-blur-md z-50 flex items-center justify-center">
          <LoadingState message="Trocando de perfil e atualizando recomendações..." />
        </div>
      ) : null}

      {/* Main Content Area: Offset by Navbar height (h-20 = 80px) */}
      <main className="flex-grow pt-20 flex flex-col">
        {children}
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Global Theater Player Modal Overlay */}
      {playingMovie && (
        <VideoPlayerModal 
          movie={playingMovie} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}
    </div>
  );
}
