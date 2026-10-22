/** In-memory storage. Used in tests; values are lost when the app restarts. */
import type { StorageService } from './types';

export function createMockStorage(): StorageService {
  const data = new Map<string, string>();
  return {
    mode: 'mock',
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
}
