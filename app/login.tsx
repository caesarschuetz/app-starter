import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Input, MockBadge, Screen, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/LanguageContext';
import { services } from '@/services';
import { useTheme } from '@/theme';
import { isValidEmail, isValidPassword } from '@/utils/validation';

type Busy = 'signIn' | 'signUp' | 'guest' | null;

export default function Login() {
  const { t } = useI18n();
  const { spacing } = useTheme();
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const isMock = services.auth.mode === 'mock';

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<boolean | void>) => {
    setBusy(kind);
    try {
      const signedIn = await action();
      if (signedIn === false) Alert.alert(t('auth.confirmEmail'));
      else router.replace('/(tabs)');
    } catch (error) {
      services.monitoring.captureException(error, { where: `login.${kind}` });
      Alert.alert(t('common.error'), error instanceof Error ? error.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const withEmail = (kind: 'signIn' | 'signUp') => {
    if (!isValidEmail(email)) return Alert.alert(t('auth.invalidEmail'));
    if (!isValidPassword(password)) return Alert.alert(t('auth.invalidPassword'));
    run(kind, () =>
      kind === 'signIn' ? signInWithEmail(email, password) : signUpWithEmail(email, password)
    );
  };

  return (
    <Screen scroll contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="title">{t('auth.title')}</Text>
        <Text muted>{t('auth.subtitle')}</Text>
        {isMock ? (
          <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
            <MockBadge />
            <Text variant="caption" muted>
              {t('auth.mockHint')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />
        <Button
          title={t('auth.signIn')}
          onPress={() => withEmail('signIn')}
          loading={busy === 'signIn'}
          disabled={busy !== null}
        />
        <Button
          variant="secondary"
          title={t('auth.signUp')}
          onPress={() => withEmail('signUp')}
          loading={busy === 'signUp'}
          disabled={busy !== null}
        />
      </View>

      <Button
        variant="ghost"
        title={t('auth.guest')}
        onPress={() => run('guest', continueAsGuest)}
        loading={busy === 'guest'}
        disabled={busy !== null}
      />
    </Screen>
  );
}
