import type { ServiceMode } from '@/config/services';

/**
 * Every analytics event and its properties. Add new events here first,
 * then call `services.analytics.track('event_name', { ... })`.
 */
export type AnalyticsEvents = {
  app_opened: undefined;
  onboarding_completed: undefined;
  sign_in: { method: 'email' | 'guest' };
  sign_up: undefined;
  paywall_viewed: undefined;
  purchase_completed: { package_id: string };
  ai_prompt_sent: { length: number };
  test_event: undefined;
};

export type AnalyticsEventName = keyof AnalyticsEvents;

export interface AnalyticsService {
  readonly mode: ServiceMode;
  track<E extends AnalyticsEventName>(
    event: E,
    ...props: AnalyticsEvents[E] extends undefined ? [] : [AnalyticsEvents[E]]
  ): void;
  /** Attach the signed-in user id to future events (null = signed out). */
  identify(userId: string | null): void;
}
