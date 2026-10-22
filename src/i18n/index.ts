/**
 * Minimal i18n without extra dependencies.
 * - `translate(lang, 'home.title', { n: 1 })` resolves a dotted key and fills {{placeholders}}.
 * - Keys are type-checked: a typo in a key is a TypeScript error.
 * - To add a language: create locales/<code>.ts typed as `Translations`, add it to `translations`.
 */
import { getLocales } from 'expo-localization';
import de from './locales/de';
import en, { type Translations } from './locales/en';

export const translations = { en, de } satisfies Record<string, Translations>;

export type Language = keyof typeof translations;
export const SUPPORTED_LANGUAGES = Object.keys(translations) as Language[];
export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', de: 'Deutsch' };

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T];

export type TranslationKey = Paths<Translations>;
export type TranslationParams = Record<string, string | number>;

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in translations;
}

export function detectDeviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isLanguage(code) ? code : DEFAULT_LANGUAGE;
}

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

export function translate(lang: Language, key: TranslationKey, params?: TranslationParams): string {
  const raw = lookup(translations[lang], key) ?? lookup(translations[DEFAULT_LANGUAGE], key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}
