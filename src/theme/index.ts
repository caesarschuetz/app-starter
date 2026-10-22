/**
 * Design tokens. Re-branding the app = edit this file (+ app.identity.js).
 * Components must use these tokens via `useTheme()`; never hardcode colors or sizes.
 */
import { useColorScheme } from 'react-native';

const palette = {
  brand: '#1F6FEB',
  brandDark: '#4C8DF6',
  white: '#FFFFFF',
  black: '#0B0D10',
  gray50: '#F6F7F9',
  gray100: '#ECEEF1',
  gray200: '#DADDE2',
  gray400: '#9AA1AC',
  gray600: '#5C6370',
  gray800: '#23272E',
  gray900: '#16191E',
  red: '#D93F3F',
  green: '#1F9D55',
};

export type ColorTokens = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  success: string;
};

const light: ColorTokens = {
  background: palette.gray50,
  surface: palette.white,
  border: palette.gray200,
  text: palette.black,
  textMuted: palette.gray600,
  primary: palette.brand,
  onPrimary: palette.white,
  danger: palette.red,
  success: palette.green,
};

const dark: ColorTokens = {
  background: palette.black,
  surface: palette.gray900,
  border: palette.gray800,
  text: palette.gray50,
  textMuted: palette.gray400,
  primary: palette.brandDark,
  onPrimary: palette.white,
  danger: palette.red,
  success: palette.green,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

// System font by default. To use a custom font, load it with expo-font and set `family`.
export const typography = {
  family: undefined as string | undefined,
  title: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  heading: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

export type TypographyVariant = Exclude<keyof typeof typography, 'family'>;

export const themes = { light, dark };

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export function getTheme(scheme: 'light' | 'dark'): Theme {
  return { scheme, colors: themes[scheme], spacing, radius, typography };
}

/** Current theme, following the system light/dark setting. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return getTheme(scheme);
}
