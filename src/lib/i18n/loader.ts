import type { Locale } from '../storage/types';

export type Messages = Record<string, string>;

const STORAGE_KEY = 'vqol.locale';
const cache = new Map<Locale, Messages>();

// Eagerly registered loaders. Vite generates a separate JSON chunk per locale.
// Adding a new locale = add an entry here + a messages/{locale}.json file.
const LOADERS: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import('../../../messages/en.json'),
  es: () => import('../../../messages/es.json'),
  fr: () => import('../../../messages/fr.json'),
  de: () => import('../../../messages/de.json'),
};

export async function loadMessages(locale: Locale): Promise<Messages> {
  const cached = cache.get(locale);
  if (cached) return cached;
  const loader = LOADERS[locale];
  if (!loader) {
    throw new Error(`No message loader registered for locale "${locale}"`);
  }
  const mod = await loader();
  cache.set(locale, mod.default);
  return mod.default;
}

export function preferredLocale(
  configDefault: Locale,
  available: readonly Locale[]
): Locale {
  // 1. localStorage override (user-chosen on a previous visit)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && available.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {
    // localStorage unavailable (private mode, etc.). fall through
  }
  // 2. Browser preference if available
  const navLocale = navigator.language?.slice(0, 2).toLowerCase() as Locale;
  if (navLocale && available.includes(navLocale)) {
    return navLocale;
  }
  // 3. Practice default
  return configDefault;
}

export function persistLocaleChoice(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function makeT(messages: Messages) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const template = messages[key];
    if (template === undefined || template === '') {
      // Fail loudly in dev, gracefully in prod
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing translation for key "${key}"`);
      }
      return `[${key}]`;
    }
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
      const v = params[name];
      return v === undefined ? `{${name}}` : String(v);
    });
  };
}
