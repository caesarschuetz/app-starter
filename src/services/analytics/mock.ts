/** Console-only analytics: events are printed in the Metro terminal. */
import type { AnalyticsService } from './types';

export function createMockAnalytics(): AnalyticsService {
  return {
    mode: 'mock',
    track(event, ...props) {
      if (__DEV__) console.log(`[analytics:mock] ${event}`, props[0] ?? '');
    },
    identify() {},
  };
}
