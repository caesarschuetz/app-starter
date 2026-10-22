import type { ComponentType } from 'react';
import type { ServiceMode } from '@/config/services';

export interface MonitoringService {
  readonly mode: ServiceMode;
  /** Report an error. Use this everywhere instead of importing Sentry. */
  captureException(error: unknown, context?: Record<string, unknown>): void;
  /** Attach the signed-in user id to future reports (null = signed out). */
  setUser(userId: string | null): void;
  /** Wraps the root component so render errors are captured. Identity in mock mode. */
  wrap<P extends object>(component: ComponentType<P>): ComponentType<P>;
}
