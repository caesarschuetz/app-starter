import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { services, StorageKeys } from '@/services';
import { useTheme } from '@/theme';

/** Entry point: decides between onboarding, login and the main tabs. */
export default function Index() {
  const { loading, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    services.storage.getItem(StorageKeys.onboardingDone).then((v) => setOnboardingDone(v === '1'));
  }, []);

  if (loading || onboardingDone === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (!isSignedIn) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)" />;
}
