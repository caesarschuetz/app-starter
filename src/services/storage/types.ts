import type { ServiceMode } from '@/config/services';

/** Key-value storage for small preferences (NOT for secrets). Never throws. */
export interface StorageService {
  readonly mode: ServiceMode;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Keys used by the app. Add new keys here so they stay in one place. */
export const StorageKeys = {
  onboardingDone: 'onboardingDone',
  language: 'language',
} as const;
