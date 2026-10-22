import { View } from 'react-native';
import { useI18n } from '@/contexts/LanguageContext';
import { useTheme } from '@/theme';
import { Text } from './Text';

/** Small label shown next to features that run on a mock service (see src/config/services.ts). */
export function MockBadge({ label }: { label?: string }) {
  const { colors, radius, spacing } = useTheme();
  const { t } = useI18n();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
      }}
    >
      <Text variant="caption" muted>
        {label ?? t('common.mockBadge')}
      </Text>
    </View>
  );
}
