/**
 * Offline purchases: two fake packages; "buying" unlocks pro in memory (resets on app restart).
 */
import { delay } from '@/utils/delay';
import type { PurchasePackage, PurchasesService } from './types';

export const MOCK_PACKAGES: PurchasePackage[] = [
  { id: 'mock_monthly', title: 'Monthly', priceString: '$4.99' },
  { id: 'mock_yearly', title: 'Yearly', priceString: '$39.99' },
];

export function createMockPurchases(): PurchasesService {
  let pro = false;
  const listeners = new Set<(isPro: boolean) => void>();
  const set = (value: boolean) => {
    pro = value;
    listeners.forEach((listener) => listener(value));
  };

  return {
    mode: 'mock',
    async identify() {},
    async isPro() {
      return pro;
    },
    async getPackages() {
      return MOCK_PACKAGES;
    },
    async purchase(packageId) {
      await delay(500);
      if (!MOCK_PACKAGES.some((p) => p.id === packageId)) throw new Error('Unknown package');
      set(true);
      return true;
    },
    async restore() {
      await delay(300);
      return pro;
    },
    onChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
