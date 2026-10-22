/**
 * Supabase Auth: email + password and anonymous sign-in ("continue without account").
 * Dashboard setup: Authentication -> Sign In / Providers -> enable Email and Anonymous sign-ins.
 */
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type { AuthService, AuthSession } from './types';

function toSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      isAnonymous: session.user.is_anonymous ?? false,
    },
  };
}

function required(session: Session | null): AuthSession {
  const mapped = toSession(session);
  if (!mapped) throw new Error('No session returned');
  return mapped;
}

export function createLiveAuth(): AuthService {
  const supabase = getSupabase();

  return {
    mode: 'live',
    async getSession() {
      const { data } = await supabase.auth.getSession();
      return toSession(data.session);
    },
    async signInWithEmail(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      return required(data.session);
    },
    async signUpWithEmail(email, password) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      return toSession(data.session);
    },
    async continueAsGuest() {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return required(data.session);
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        callback(toSession(session))
      );
      return () => data.subscription.unsubscribe();
    },
  };
}
