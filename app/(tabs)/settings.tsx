import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { Button, Card, MockBadge, Screen, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/LanguageContext';
import { usePurchases } from '@/contexts/PurchasesContext';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '@/i18n';
import { appVersion } from '@/lib/env';
import { activeModes, services } from '@/services';
import { useTheme } from '@/theme';

export default function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { colors, spacing, radius } = useTheme();
  const { session, signOut } = useAuth();
  const { isPro, restore } = usePurchases();
  const modes = activeModes();

  const onRestore = async () => {
    try {
      const pro = await restore();
      Alert.alert(pro ? t('settings.restored') : t('settings.nothingToRestore'));
    } catch (error) {
      services.monitoring.captureException(error, { where: 'settings.restore' });
      Alert.alert(t('common.error'));
    }
  };

  const onSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      services.monitoring.captureException(error, { where: 'settings.signOut' });
      Alert.alert(t('common.error'));
    }
  };

  const email = session?.user.email;

  return (
    <Screen scroll edges={['top']}>
      <Text variant="title">{t('settings.title')}</Text>

      <Card>
        <Text variant="label" muted>
          {t('settings.language')}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang === language;
            return (
              <Pressable
                key={lang}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setLanguage(lang)}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : 'transparent',
                }}
              >
                <Text variant="label" color={active ? colors.onPrimary : colors.text}>
                  {LANGUAGE_NAMES[lang]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="label" muted>
          {t('settings.subscription')}
        </Text>
        <Text>{isPro ? t('settings.statusPro') : t('settings.statusFree')}</Text>
        {!isPro ? (
          <Button
            variant="secondary"
            title={t('settings.upgrade')}
            onPress={() => router.push('/paywall')}
          />
        ) : null}
        <Button variant="ghost" title={t('settings.restore')} onPress={onRestore} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="label" muted>
          {t('settings.account')}
        </Text>
        <Text>{email ? t('settings.signedInAs', { email }) : t('settings.guest')}</Text>
        <Button variant="secondary" title={t('settings.signOut')} onPress={onSignOut} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="label" muted>
          {t('settings.services')}
        </Text>
        {Object.entries(modes).map(([name, mode]) => (
          <View
            key={name}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text>{name}</Text>
            {mode === 'mock' ? (
              <MockBadge label={t('settings.modeMock')} />
            ) : (
              <Text variant="label" color={colors.success}>
                {t('settings.modeLive')}
              </Text>
            )}
          </View>
        ))}
        <Text variant="caption" muted>
          {t('settings.servicesHint')}
        </Text>
      </Card>

      <Text variant="caption" muted center>
        {t('settings.version', { version: appVersion })}
      </Text>
    </Screen>
  );
}
