import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  /** Safe-area edges to pad. Tab screens usually skip 'bottom' (the tab bar handles it). */
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

/** Page wrapper: background color, safe-area insets (iOS + Android edge-to-edge), padding. */
export function Screen({ children, scroll, edges = ['top', 'bottom'], contentStyle }: ScreenProps) {
  const { colors, spacing } = useTheme();
  const inner = [{ padding: spacing.lg, gap: spacing.lg }, contentStyle];
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
