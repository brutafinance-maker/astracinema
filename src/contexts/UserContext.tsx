import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from './AuthContext';

interface UserContextType {
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  switchProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
const KIDS_AVATAR = 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&q=80';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync active profile and available switcher profiles with Firebase authenticated user
  useEffect(() => {
    if (currentUser) {
      const primary: UserProfile = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Usuário',
        avatarUrl: currentUser.photoURL || DEFAULT_AVATAR,
        isKid: false
      };
      
      const kids: UserProfile = {
        id: `${currentUser.uid}-kids`,
        name: 'Ana (Kids)',
        avatarUrl: KIDS_AVATAR,
        isKid: true
      };

      setProfiles([primary, kids]);
      // Set primary as active on initial login if none was active
      setActiveProfile(prev => {
        if (!prev || (prev.id !== primary.id && prev.id !== kids.id)) {
          return primary;
        }
        return prev;
      });
    } else {
      setActiveProfile(null);
      setProfiles([]);
    }
  }, [currentUser]);

  const switchProfile = (profile: UserProfile) => {
    setIsLoading(true);
    // Simulate premium visual loading animation to demonstrate transitions between profiles
    setTimeout(() => {
      setActiveProfile(profile);
      setIsLoading(false);
    }, 600);
  };

  return (
    <UserContext.Provider value={{ activeProfile, profiles, switchProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
