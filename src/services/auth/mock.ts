/**
 * Offline auth: accepts any valid email + password (min. 6 characters).
 * The fake session is saved via the storage service so it survives app reloads.
 */
import { delay } from '@/utils/delay';
import type { StorageService } from '../storage/types';
import { MIN_PASSWORD_LENGTH, type AuthService, type AuthSession } from './types';

const SESSION_KEY = 'mockAuthSession';

export function createMockAuth(storage: StorageService): AuthService {
  const listeners = new Set<(session: AuthSession | null) => void>();

  async function setSession(session: AuthSession | null) {
    if (session) await storage.setItem(SESSION_KEY, JSON.stringify(session));
    else await storage.removeItem(SESSION_KEY);
    listeners.forEach((listener) => listener(session));
  }

  async function signIn(email: string, password: string): Promise<AuthSession> {
    await delay(300);
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error('Password too short');
    const session: AuthSession = {
      user: { id: 'mock-user', email: email.trim().toLowerCase(), isAnonymous: false },
    };
    await setSession(session);
    return session;
  }

  return {
    mode: 'mock',
    async getSession() {
      const raw = await storage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as AuthSession;
      } catch {
        return null;
      }
    },
    signInWithEmail: signIn,
    signUpWithEmail: signIn,
    async continueAsGuest() {
      const session: AuthSession = { user: { id: 'mock-guest', email: null, isAnonymous: true } };
      await setSession(session);
      return session;
    },
    async signOut() {
      await setSession(null);
    },
    onChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
