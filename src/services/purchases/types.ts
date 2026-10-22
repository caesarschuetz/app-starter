import type { ServiceMode } from '@/config/services';

export type PurchasePackage = {
  /** Package identifier, e.g. "$rc_monthly". */
  id: string;
  title: string;
  /** Localized price from the store, e.g. "4,99 €". */
  priceString: string;
};

export interface PurchasesService {
  readonly mode: ServiceMode;
  /** Link purchases to your user id (null = signed out). Call after every sign-in / sign-out. */
  identify(userId: string | null): Promise<void>;
  /** True if the user has the "pro" entitlement. */
  isPro(): Promise<boolean>;
  /** Packages of the current offering, for the paywall. */
  getPackages(): Promise<PurchasePackage[]>;
  /** Starts the store purchase. Resolves to the new pro state (false if cancelled). */
  purchase(packageId: string): Promise<boolean>;
  /** Restores earlier purchases. Resolves to the new pro state. */
  restore(): Promise<boolean>;
  /** Called whenever the pro state changes. Returns an unsubscribe function. */
  onChange(callback: (isPro: boolean) => void): () => void;
}
