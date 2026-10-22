/** AsyncStorage on the device (works in Expo Go, no keys needed). Best-effort: never throws. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageService } from './types';

const PREFIX = 'app:';

export function createLiveStorage(): StorageService {
  return {
    mode: 'live',
    async getItem(key) {
      try {
        return await AsyncStorage.getItem(PREFIX + key);
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        await AsyncStorage.setItem(PREFIX + key, value);
      } catch {
        // Preferences are best-effort.
      }
    },
    async removeItem(key) {
      try {
        await AsyncStorage.removeItem(PREFIX + key);
      } catch {
        // ignore
      }
    },
  };
}
