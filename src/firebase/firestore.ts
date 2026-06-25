import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  collection,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './config';
import { ContentItem, UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Standard error handling wrapper to meet strict security debugging specs
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validation connection helper as specified in the skill prerequisite
 */
export async function testFirestoreConnection() {
  const path = 'test/connection';
  try {
    // Attempt a silent server fetch to verify connection setup
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
    // We swallow normal connection errors if the document doesn't exist to avoid crashing.
  }
}

export const firestoreService = {
  /**
   * Fetches the user profile from Firestore
   */
  async getUserDoc(userId: string) {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Creates or updates user details in Firestore
   */
  async setUserDoc(userId: string, data: any) {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Stubs for profile operations (can load subprofiles or fallback to user profiles)
   */
  async getUserProfiles(userId: string): Promise<UserProfile[]> {
    const path = `users/${userId}/profiles`;
    try {
      // In the future, we could store subprofiles under subcollections.
      // For now, we will dynamically derive them or load them.
      const userProfile = await this.getUserDoc(userId);
      if (userProfile) {
        return [
          {
            id: userId,
            name: userProfile.name || 'Usuário',
            avatarUrl: userProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            isKid: false
          },
          {
            id: `${userId}-kids`,
            name: 'Kids',
            avatarUrl: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&q=80',
            isKid: true
          }
        ];
      }
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
   * Sync favorites to Firestore under specific user profile
   */
  async syncFavorites(userId: string, profileId: string, favorites: string[]): Promise<void> {
    const path = `users/${userId}/favorites/${profileId}`;
    try {
      // Sync favorites to user's profile state document
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        [`favorites_${profileId}`]: favorites
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Sync watch history items to Firestore under specific user profile
   */
  async syncWatchHistory(userId: string, profileId: string, history: any[]): Promise<void> {
    const path = `users/${userId}/history/${profileId}`;
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        [`history_${profileId}`]: history
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
