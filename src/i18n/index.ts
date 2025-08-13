import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import koTranslations from './locales/ko.json';
import enTranslations from './locales/en.json';
import jaTranslations from './locales/ja.json';

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