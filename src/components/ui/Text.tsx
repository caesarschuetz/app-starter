import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme, type TypographyVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  muted?: boolean;
  color?: string;
  center?: boolean;
};

/** Use instead of React Native's <Text> so typography + colors come from the theme. */
export function Text({ variant = 'body', muted, color, center, style, ...rest }: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: color ?? (muted ? theme.colors.textMuted : theme.colors.text) },
        theme.typography.family ? { fontFamily: theme.typography.family } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
