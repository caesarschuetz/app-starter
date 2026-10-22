import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Screen, Text } from '@/components/ui';
import { useI18n } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { services, StorageKeys } from '@/services';
import { useTheme } from '@/theme';

const PAGES: { title: TranslationKey; body: TranslationKey }[] = [
  { title: 'onboarding.page1Title', body: 'onboarding.page1Body' },
  { title: 'onboarding.page2Title', body: 'onboarding.page2Body' },
  { title: 'onboarding.page3Title', body: 'onboarding.page3Body' },
];

export default function Onboarding() {
  const { t } = useI18n();
  const { colors, spacing, radius } = useTheme();
  const [index, setIndex] = useState(0);
  const isLast = index === PAGES.length - 1;
  const page = PAGES[index];

  const next = async () => {
    if (!isLast) return setIndex(index + 1);
    await services.storage.setItem(StorageKeys.onboardingDone, '1');
    services.analytics.track('onboarding_completed');
    router.replace('/login');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <Text variant="title">{t(page.title)}</Text>
        <Text muted>{t(page.body)}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, alignSelf: 'center' }}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === index ? 20 : 8,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: i === index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Button title={isLast ? t('onboarding.getStarted') : t('common.continue')} onPress={next} />
        {index > 0 ? (
          <Button variant="ghost" title={t('common.back')} onPress={() => setIndex(index - 1)} />
        ) : null}
      </View>
    </Screen>
  );
}
