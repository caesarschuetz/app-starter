/**
 * Entitlement state ("is the user pro?"). Screens read `isPro` and call `purchase` / `restore`.
 * All logic goes through `services.purchases` (mock or RevenueCat).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { services } from '@/services';

type PurchasesContextValue = {
  isPro: boolean;
  ready: boolean;
  /** Resolves to true if the user is pro afterwards (false = cancelled). */
  purchase: (packageId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
};

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    services.purchases
      .isPro()
      .then(setIsPro)
      .catch((error) => services.monitoring.captureException(error, { where: 'purchases.init' }))
      .finally(() => setReady(true));
    return services.purchases.onChange(setIsPro);
  }, []);

  const purchase = useCallback(async (packageId: string) => {
    const pro = await services.purchases.purchase(packageId);
    setIsPro(pro);
    if (pro) {
      services.haptics.success();
      services.analytics.track('purchase_completed', { package_id: packageId });
    }
    return pro;
  }, []);

  const restore = useCallback(async () => {
    const pro = await services.purchases.restore();
    setIsPro(pro);
    return pro;
  }, []);

  const value = useMemo(
    () => ({ isPro, ready, purchase, restore }),
    [isPro, ready, purchase, restore]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used inside <PurchasesProvider>');
  return ctx;
}
