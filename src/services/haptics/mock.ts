/** No vibration (web, tests). */
import type { HapticsService } from './types';

export function createMockHaptics(): HapticsService {
  return { mode: 'mock', tap() {}, success() {} };
}
