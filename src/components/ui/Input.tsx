import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';

export function Input({ style, ...rest }: TextInputProps) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        typography.body,
        {
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          minHeight: 48,
        },
        style,
      ]}
      {...rest}
    />
  );
}
