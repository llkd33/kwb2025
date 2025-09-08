import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files (Deno requires JSON import assertions)
// Using import assertions keeps compatibility with modern bundlers
import koTranslations from './locales/ko.json' assert { type: 'json' };
import enTranslations from './locales/en.json' assert { type: 'json' };
import jaTranslations from './locales/ja.json' assert { type: 'json' };

const resources = {
  ko: {
    translation: koTranslations
  },
  en: {
    translation: enTranslations
  },
  ja: {
    translation: jaTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
