import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  detectDeviceLanguage,
  isLanguage,
  translate,
  type Language,
  type TranslationKey,
  type TranslationParams,
} from '@/i18n';
import { services, StorageKeys } from '@/services';

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Priority: saved choice -> device language -> English. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);

  useEffect(() => {
    services.storage.getItem(StorageKeys.language).then((saved) => {
      if (isLanguage(saved)) setLanguageState(saved);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    services.storage.setItem(StorageKeys.language, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
