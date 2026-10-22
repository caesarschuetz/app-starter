/**
 * The ONLY place in the app that reads environment variables.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` at bundle time, but only when accessed
 * with the full static name (no `process.env[key]`). That's why every variable is
 * listed explicitly below. Missing values become `undefined`, never throw.
 * After changing .env, restart Metro with `npx expo start -c`.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const env = {
  supabaseUrl: clean(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: clean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  aiFunctionName: clean(process.env.EXPO_PUBLIC_AI_FUNCTION_NAME) ?? 'ai',
  revenueCatIosKey: clean(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY),
  revenueCatAndroidKey: clean(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY),
  revenueCatEntitlement: clean(process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT) ?? 'pro',
  sentryDsn: clean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  amplitudeApiKey: clean(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY),
};

export type Env = typeof env;

/** True inside the Expo Go app, where custom native modules (e.g. RevenueCat) are unavailable. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const appVersion = Constants.expoConfig?.version ?? '0.0.0';
