import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export type Language = 'ko' | 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  
  const language = (i18nInstance.language || 'ko') as Language;
  const isLoading = !i18nInstance.isInitialized;

  const setLanguage = (lang: Language) => {
    i18nInstance.changeLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document language and direction
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr'; // All supported languages are LTR
  };

  useEffect(() => {
    // Initialize language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ko', 'en', 'ja'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};