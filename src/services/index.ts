/**
 * Service registry: the ONLY way screens, hooks and contexts reach a backend.
 *
 *   import { services } from '@/services';
 *   await services.auth.signInWithEmail(email, password);
 *
 * Which implementation (mock or live) each service uses is decided by
 * src/config/services.ts. Live implementations are loaded lazily with `require`,
 * so vendor SDKs (Sentry, RevenueCat, ...) are never executed in mock mode.
 * Never import a vendor SDK outside src/services/<name>/live.ts (or src/lib).
 */
import { Platform } from 'react-native';
import { SERVICE_MODE, type ServiceMode, type ServiceName } from '@/config/services';
import { env as defaultEnv, isExpoGo, type Env } from '@/lib/env';
import { createMockAi } from './ai/mock';
import type { AiService } from './ai/types';
import { createMockAnalytics } from './analytics/mock';
import type { AnalyticsService } from './analytics/types';
import { createMockAuth } from './auth/mock';
import type { AuthService } from './auth/types';
import { createMockHaptics } from './haptics/mock';
import type { HapticsService } from './haptics/types';
import { createMockMonitoring } from './monitoring/mock';
import type { MonitoringService } from './monitoring/types';
import { createMockPurchases } from './purchases/mock';
import type { PurchasesService } from './purchases/types';
import { createMockStorage } from './storage/mock';
import type { StorageService } from './storage/types';

export type Services = {
  auth: AuthService;
  purchases: PurchasesService;
  ai: AiService;
  monitoring: MonitoringService;
  analytics: AnalyticsService;
  /** Device-only helpers: no account or keys, so they are not in the central switch. */
  storage: StorageService;
  haptics: HapticsService;
};

export type BuildContext = {
  modes: Record<ServiceName, ServiceMode>;
  env: Env;
  platform: string;
  expoGo: boolean;
  warn: (message: string) => void;
};

/**
 * Why a service cannot run live in this environment, or null if it can.
 * Pure function so it can be unit-tested.
 */
export function liveBlocker(
  name: ServiceName,
  ctx: Pick<BuildContext, 'env' | 'platform' | 'expoGo'>
): string | null {
  const { env, platform, expoGo } = ctx;
  const supabaseMissing =
    !env.supabaseUrl || !env.supabaseAnonKey
      ? 'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY not set'
      : null;
  switch (name) {
    case 'auth':
    case 'ai':
      return supabaseMissing;
    case 'purchases': {
      if (platform === 'web') return 'RevenueCat does not run on web';
      if (expoGo) return 'RevenueCat needs a development build, it does not run in Expo Go';
      const key = platform === 'ios' ? env.revenueCatIosKey : env.revenueCatAndroidKey;
      const keyName = `EXPO_PUBLIC_REVENUECAT_${platform === 'ios' ? 'IOS' : 'ANDROID'}_API_KEY`;
      return key ? null : `${keyName} not set`;
    }
    case 'monitoring':
      if (platform === 'web') return 'Sentry is not set up for web in this template';
      return env.sentryDsn ? null : 'EXPO_PUBLIC_SENTRY_DSN not set';
    case 'analytics':
      return env.amplitudeApiKey ? null : 'EXPO_PUBLIC_AMPLITUDE_API_KEY not set';
  }
}

/* eslint-disable @typescript-eslint/no-require-imports */
const liveFactories = {
  auth: () => require('./auth/live').createLiveAuth() as AuthService,
  purchases: () => require('./purchases/live').createLivePurchases() as PurchasesService,
  ai: () => require('./ai/live').createLiveAi() as AiService,
  monitoring: () => require('./monitoring/live').createLiveMonitoring() as MonitoringService,
  analytics: () => require('./analytics/live').createLiveAnalytics() as AnalyticsService,
};
const createLiveStorage = () => require('./storage/live').createLiveStorage() as StorageService;
const createLiveHaptics = () => require('./haptics/live').createLiveHaptics() as HapticsService;
/* eslint-enable @typescript-eslint/no-require-imports */

export function buildServices(overrides: Partial<BuildContext> = {}): Services {
  const ctx: BuildContext = {
    modes: SERVICE_MODE,
    env: defaultEnv,
    platform: Platform.OS,
    expoGo: isExpoGo,
    warn: (message) => console.warn(message),
    ...overrides,
  };

  // Device helpers: real on a phone, in-memory / no-op in tests and on web (haptics).
  const isTest = process.env.NODE_ENV === 'test';
  const storage = isTest ? createMockStorage() : createLiveStorage();
  const haptics = isTest || ctx.platform === 'web' ? createMockHaptics() : createLiveHaptics();

  const mocks = {
    auth: () => createMockAuth(storage),
    purchases: createMockPurchases,
    ai: createMockAi,
    monitoring: createMockMonitoring,
    analytics: createMockAnalytics,
  };

  function pick<K extends ServiceName>(name: K): ReturnType<(typeof mocks)[K]> {
    type T = ReturnType<(typeof mocks)[K]>;
    if (ctx.modes[name] !== 'live') return mocks[name]() as T;
    const blocker = liveBlocker(name, ctx);
    if (blocker) {
      ctx.warn(`[services] "${name}" is set to 'live' but ${blocker}. Falling back to mock.`);
      return mocks[name]() as T;
    }
    try {
      return liveFactories[name]() as T;
    } catch (error) {
      ctx.warn(
        `[services] "${name}" failed to start live (${String(error)}). Falling back to mock.`
      );
      return mocks[name]() as T;
    }
  }

  return {
    auth: pick('auth'),
    purchases: pick('purchases'),
    ai: pick('ai'),
    monitoring: pick('monitoring'),
    analytics: pick('analytics'),
    storage,
    haptics,
  };
}

export const services: Services = buildServices();

/** The mode each switchable service is actually running in (after any fallback). */
export function activeModes(s: Services = services): Record<ServiceName, ServiceMode> {
  return {
    auth: s.auth.mode,
    purchases: s.purchases.mode,
    ai: s.ai.mode,
    monitoring: s.monitoring.mode,
    analytics: s.analytics.mode,
  };
}

export { StorageKeys } from './storage/types';
export type { AuthSession, AuthUser } from './auth/types';
export type { PurchasePackage } from './purchases/types';
export type { AnalyticsEvents } from './analytics/types';
