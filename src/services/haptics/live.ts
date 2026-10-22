/** expo-haptics (works in Expo Go). Errors on unsupported devices are ignored. */
import * as Haptics from 'expo-haptics';
import type { HapticsService } from './types';

export function createLiveHaptics(): HapticsService {
  return {
    mode: 'live',
    tap() {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    success() {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  };
}
