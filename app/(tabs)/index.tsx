import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Screen, Text } from '@/components/ui';
import { useI18n } from '@/contexts/LanguageContext';
import { usePurchases } from '@/contexts/PurchasesContext';
import { useTheme } from '@/theme';

// Placeholder data. Replace with data from your own service (see CLAUDE.md, "Services").
const ITEMS = Array.from({ length: 6 }, (_, i) => ({ id: String(i + 1), n: i + 1 }));

export default function Home() {
  const { t } = useI18n();
  const { spacing } = useTheme();
  const { isPro } = usePurchases();

  return (
    <Screen scroll edges={['top']}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="title">{t('home.title')}</Text>
        <Text muted>{t('home.subtitle')}</Text>
      </View>

      {!isPro ? (
        <Card onPress={() => router.push('/paywall')}>
          <Text variant="heading">{t('home.proCard')}</Text>
          <Text muted>{t('home.proCardBody')}</Text>
        </Card>
      ) : null}

      {ITEMS.map((item) => (
        <Card key={item.id}>
          <Text variant="heading">{t('home.itemTitle', { n: item.n })}</Text>
          <Text muted>{t('home.itemBody')}</Text>
        </Card>
      ))}
    </Screen>
  );
}
