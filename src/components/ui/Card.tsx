import { Pressable, View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';

export type CardProps = ViewProps & { onPress?: () => void };

export function Card({ style, onPress, children, ...rest }: CardProps) {
  const { colors, radius, spacing } = useTheme();
  const cardStyle = [
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.85 : 1 }]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
}
