/** Console-only error reporting. */
import type { MonitoringService } from './types';

export function createMockMonitoring(): MonitoringService {
  return {
    mode: 'mock',
    captureException(error, context) {
      console.warn('[monitoring:mock]', error, context ?? '');
    },
    setUser() {},
    wrap(component) {
      return component;
    },
  };
}
