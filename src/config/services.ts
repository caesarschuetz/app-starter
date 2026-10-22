/**
 * ONE SWITCH FOR ALL BACKEND SERVICES
 * ------------------------------------
 * Every service has two implementations side by side in src/services/<name>/:
 *   - mock.ts  works offline, needs no account and no keys (default)
 *   - live.ts  talks to the real vendor (Supabase, RevenueCat, Sentry, Amplitude)
 *
 * To turn a service on:
 *   1. Create the account and copy its keys into .env (start from .env.example).
 *   2. Change its value below from 'mock' to 'live'.
 *   3. Restart Metro with a clean cache: `npx expo start -c`.
 *
 * If a service is 'live' but its keys are missing (or it needs a native module that
 * Expo Go does not have), the app logs ONE warning and falls back to the mock.
 * It never crashes. Settings shows which mode each service is actually running in.
 *
 * Recommended order: auth -> ai -> purchases -> monitoring -> analytics.
 * Note: 'ai' live needs 'auth' live too (the edge function checks the user's login).
 */
export const SERVICE_MODE = {
  auth: 'mock',
  purchases: 'mock',
  ai: 'mock',
  monitoring: 'mock',
  analytics: 'mock',
} as const;

export type ServiceName = keyof typeof SERVICE_MODE;
export type ServiceMode = 'mock' | 'live';
