import type { ServiceMode } from '@/config/services';

export type AuthUser = {
  id: string;
  email: string | null;
  /** True for "continue without account" users. */
  isAnonymous: boolean;
};

export type AuthSession = { user: AuthUser };

export interface AuthService {
  readonly mode: ServiceMode;
  /** The stored session, or null if signed out. */
  getSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  /** Returns null when the backend requires email confirmation before the first sign-in. */
  signUpWithEmail(email: string, password: string): Promise<AuthSession | null>;
  /** "Continue without account". */
  continueAsGuest(): Promise<AuthSession>;
  signOut(): Promise<void>;
  /** Called on every sign-in / sign-out. Returns an unsubscribe function. */
  onChange(callback: (session: AuthSession | null) => void): () => void;
}

export const MIN_PASSWORD_LENGTH = 6;
