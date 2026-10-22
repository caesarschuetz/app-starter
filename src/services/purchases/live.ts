/**
 * RevenueCat in-app purchases.
 * Needs a development build (`eas build --profile development`), NOT Expo Go:
 * react-native-purchases is a native module. It is required lazily inside this
 * function so Expo Go / mock mode never loads it.
 */
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { env } from '@/lib/env';
import type { PurchasesService } from './types';

type PurchasesModule = typeof import('react-native-purchases').default;

export function createLivePurchases(): PurchasesService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Purchases = require('react-native-purchases').default as PurchasesModule;
  const apiKey = Platform.OS === 'ios' ? env.revenueCatIosKey : env.revenueCatAndroidKey;
  if (!apiKey) throw new Error('RevenueCat API key missing for this platform');

  if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });

  const hasPro = (info: CustomerInfo) =>
    Boolean(info.entitlements.active[env.revenueCatEntitlement]);

  async function findPackage(id: string): Promise<PurchasesPackage> {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find((p) => p.identifier === id);
    if (!pkg) throw new Error(`Package ${id} not found in current offering`);
    return pkg;
  }

  return {
    mode: 'live',
    async identify(userId) {
      if (userId) await Purchases.logIn(userId);
      else if (!(await Purchases.isAnonymous())) await Purchases.logOut();
    },
    async isPro() {
      return hasPro(await Purchases.getCustomerInfo());
    },
    async getPackages() {
      const offerings = await Purchases.getOfferings();
      return (offerings.current?.availablePackages ?? []).map((p) => ({
        id: p.identifier,
        title: p.product.title,
        priceString: p.product.priceString,
      }));
    },
    async purchase(packageId) {
      try {
        const { customerInfo } = await Purchases.purchasePackage(await findPackage(packageId));
        return hasPro(customerInfo);
      } catch (error) {
        if ((error as { userCancelled?: boolean }).userCancelled) return false;
        throw error;
      }
    },
    async restore() {
      return hasPro(await Purchases.restorePurchases());
    },
    onChange(callback) {
      const listener = (info: CustomerInfo) => callback(hasPro(info));
      Purchases.addCustomerInfoUpdateListener(listener);
      return () => {
        Purchases.removeCustomerInfoUpdateListener(listener);
      };
    },
  };
}
