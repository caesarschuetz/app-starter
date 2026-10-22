/** Sentry error monitoring. Not available on web (falls back to mock there). */
import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';
import { env } from '@/lib/env';
import type { MonitoringService } from './types';

export function createLiveMonitoring(): MonitoringService {
  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: 0.2,
    sendDefaultPii: false,
  });

  return {
    mode: 'live',
    captureException(error, context) {
      if (__DEV__) console.warn('[monitoring]', error, context ?? '');
      Sentry.captureException(error, context ? { extra: context } : undefined);
    },
    setUser(userId) {
      Sentry.setUser(userId ? { id: userId } : null);
    },
    wrap<P extends object>(component: ComponentType<P>) {
      return Sentry.wrap(component as ComponentType<Record<string, unknown>>) as ComponentType<P>;
    },
  };
}
