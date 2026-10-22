/** Amplitude product analytics. Events also appear in the Metro console in dev builds. */
import * as amplitude from '@amplitude/analytics-react-native';
import { env } from '@/lib/env';
import type { AnalyticsService } from './types';

export function createLiveAnalytics(): AnalyticsService {
  amplitude.init(env.amplitudeApiKey ?? '', undefined, { disableCookies: true });

  return {
    mode: 'live',
    track(event, ...props) {
      const properties = props[0] as Record<string, unknown> | undefined;
      if (__DEV__) console.log(`[analytics] ${event}`, properties ?? '');
      amplitude.track(event, properties);
    },
    identify(userId) {
      if (userId) amplitude.setUserId(userId);
      else amplitude.reset();
    },
  };
}
