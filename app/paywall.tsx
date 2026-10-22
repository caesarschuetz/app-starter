import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Button, Card, MockBadge, Screen, Text } from '@/components/ui';
import { useI18n } from '@/contexts/LanguageContext';
import { usePurchases } from '@/contexts/PurchasesContext';
import { services, type PurchasePackage } from '@/services';
import { useTheme } from '@/theme';

/** Simple paywall built from UI primitives. Packages come from services.purchases. */
export default function Paywall() {
  const { t } = useI18n();
  const { colors, spacing } = useTheme();
  const { isPro, purchase } = usePurchases();
  const [packages, setPackages] = useState<PurchasePackage[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const isMock = services.purchases.mode === 'mock';

  useEffect(() => {
    services.analytics.track('paywall_viewed');
    services.purchases
      .getPackages()
      .then(setPackages)
      .catch((error) => {
        services.monitoring.captureException(error, { where: 'paywall.packages' });
        setPackages([]);
      });
  }, []);

  const buy = async (pkg: PurchasePackage) => {
    setBuying(pkg.id);
    try {
      if (await purchase(pkg.id)) router.back();
    } catch (error) {
      services.monitoring.captureException(error, { where: 'paywall.purchase' });
      Alert.alert(t('common.error'));
    } finally {
      setBuying(null);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{t('paywall.title')}</Text>
          <Text muted>{t('paywall.subtitle')}</Text>
        </View>
        <Card>
          <Text>{t('paywall.benefit1')}</Text>
          <Text>{t('paywall.benefit2')}</Text>
          <Text>{t('paywall.benefit3')}</Text>
        </Card>
        {isPro ? <Text muted>{t('paywall.alreadyPro')}</Text> : null}
        {isMock ? (
          <View style={{ gap: spacing.xs }}>
            <MockBadge />
            <Text variant="caption" muted>
              {t('paywall.mockHint')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        {packages === null ? <ActivityIndicator color={colors.primary} /> : null}
        {packages?.length === 0 ? <Text muted>{t('paywall.noPackages')}</Text> : null}
        {!isPro
          ? packages?.map((pkg) => (
              <Button
                key={pkg.id}
                title={t('paywall.buy', { title: pkg.title, price: pkg.priceString })}
                onPress={() => buy(pkg)}
                loading={buying === pkg.id}
                disabled={buying !== null}
              />
            ))
          : null}
        <Button variant="ghost" title={t('paywall.close')} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
