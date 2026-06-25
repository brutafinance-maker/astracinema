import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export interface AuthSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Maps Firebase Auth errors to clear Brazilian Portuguese user messages
export function mapAuthErrorToMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido. Por favor, verifique a digitação.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado. Entre em contato com o suporte.';
    case 'auth/user-not-found':
      return 'Usuário não cadastrado. Crie uma conta para acessar.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Verifique os dados e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este endereço de e-mail já está sendo utilizado por outra conta.';
    case 'auth/weak-password':
      return 'Senha muito fraca. Escolha uma senha com pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique sua internet e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas malsucedidas de login. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro inesperado na autenticação. Tente novamente.';
  }
}

export const firebaseAuthService = {
  /**
   * Triggers the user sign in with email & password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthSession> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error: any) {
      const code = error?.code || 'auth/unknown';
      throw new Error(mapAuthErrorToMessage(code));
    }
  },

  /**
   * Registers a new user session with password and updates local + Firestore record
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthSession> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

      // 1. Update firebase auth profile details
      await updateProfile(user, {
        displayName: name,
        photoURL: defaultAvatar
      });

      // 2. Automatically create document under 'users' collection in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: name,
        email: email,
        photoURL: defaultAvatar,
        createdAt: serverTimestamp()
      });

      return {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: defaultAvatar,
      };
    } catch (error: any) {
      const code = error?.code || 'auth/unknown';
      throw new Error(mapAuthErrorToMessage(code));
    }
  },

  /**
   * Logs out the currently active auth session
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Erro ao fazer logout. Verifique sua conexão.');
    }
  },

  /**
   * Setups state observer for active authentication session
   */
  onAuthStateChanged(callback: (user: AuthSession | null) => void): () => void {
    return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        callback(null);
      }
    });
  }
};
