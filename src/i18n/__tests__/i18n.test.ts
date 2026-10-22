import { translate, translations } from '@/i18n';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefix}${k}`] : keys(v as object, `${prefix}${k}.`)
  );
}

function placeholders(obj: object, key: string): string[] {
  const value = key.split('.').reduce<unknown>((node, part) => (node as never)[part], obj);
  return [...String(value).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
}

describe('i18n', () => {
  const english = keys(translations.en).sort();

  it.each(Object.keys(translations))('%s has exactly the same keys as en', (lang) => {
    expect(keys(translations[lang as keyof typeof translations]).sort()).toEqual(english);
  });

  it.each(Object.keys(translations))('%s uses the same {{placeholders}} as en', (lang) => {
    for (const key of english) {
      expect([
        lang,
        key,
        placeholders(translations[lang as keyof typeof translations], key),
      ]).toEqual([lang, key, placeholders(translations.en, key)]);
    }
  });

  it('has no empty strings', () => {
    for (const dict of Object.values(translations)) {
      for (const key of keys(dict)) expect(translate('en', key as never)).not.toBe('');
    }
  });

  it('fills placeholders', () => {
    expect(translate('en', 'home.itemTitle', { n: 3 })).toBe('Item 3');
    expect(translate('de', 'home.itemTitle', { n: 3 })).toBe('Eintrag 3');
  });
});
