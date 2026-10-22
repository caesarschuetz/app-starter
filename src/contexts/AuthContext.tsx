/**
 * Auth state for the whole app. All logic goes through `services.auth`,
 * so this file works the same in mock and live mode.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { services, type AuthSession } from '@/services';

type AuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  isSignedIn: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Returns false when the backend wants the user to confirm their email first. */
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    services.auth
      .getSession()
      .then(setSession)
      .catch((error) => services.monitoring.captureException(error, { where: 'auth.getSession' }))
      .finally(() => setLoading(false));
    return services.auth.onChange(setSession);
  }, []);

  // Keep monitoring, analytics and purchases in sync with the signed-in user.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    services.monitoring.setUser(userId);
    services.analytics.identify(userId);
    services.purchases
      .identify(userId)
      .catch((error) =>
        services.monitoring.captureException(error, { where: 'purchases.identify' })
      );
  }, [userId]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setSession(await services.auth.signInWithEmail(email, password));
    services.analytics.track('sign_in', { method: 'email' });
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const next = await services.auth.signUpWithEmail(email, password);
    services.analytics.track('sign_up');
    if (next) setSession(next);
    return Boolean(next);
  }, []);

  const continueAsGuest = useCallback(async () => {
    setSession(await services.auth.continueAsGuest());
    services.analytics.track('sign_in', { method: 'guest' });
  }, []);

  const signOut = useCallback(async () => {
    await services.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      isSignedIn: Boolean(session),
      signInWithEmail,
      signUpWithEmail,
      continueAsGuest,
      signOut,
    }),
    [loading, session, signInWithEmail, signUpWithEmail, continueAsGuest, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
