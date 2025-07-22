import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'ko' | 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
  const [language, setLanguage] = useState<Language>('ko');

  const translations = {
    ko: {
      // Service name - shortened
      'service.name': 'KnowWhere Bridge',
      
      // Auth
      'auth.title': 'KnowWhere Bridge',
      'auth.subtitle': '해외진출 매칭 플랫폼에 오신 것을 환영합니다',
      'auth.login': '로그인',
      'auth.signup': '회원가입',
      'auth.email': '이메일',
      'auth.password': '비밀번호',
      'auth.login.button': '로그인',
      'auth.signup.button': '회원가입',
      
      // Navigation
      'nav.home': '홈',
      'nav.services': '서비스',
      'nav.about': '회사소개',
      'nav.login': '로그인',
      'nav.dashboard': '대시보드',
      'nav.logout': '로그아웃',
      
      // Homepage
      'home.hero.badge': 'AI 기반 글로벌 비즈니스 분석',
      'home.hero.title': '글로벌 비즈니스 매칭의\n새로운 기준',
      'home.hero.subtitle': '해외진출을 꿈꾸는 기업과 글로벌 파트너를 연결하는\n스마트한 매칭 플랫폼',
      'home.hero.start': '분석 시작하기',
      'home.hero.explore': '서비스 둘러보기',
      
      // Services page
      'services.hero.badge': 'AI 기반 글로벌 비즈니스 매칭',
      'services.hero.title.highlight': '세계 최고 수준의',
      'services.hero.title.main': 'AI 시장분석 서비스',
      'services.hero.subtitle': 'Goldman Sachs급 시장분석 리포트로 최적의 글로벌 파트너, 투자자, 고객을 매칭합니다.',
      'services.hero.cta': '무료 분석 시작하기',
      'services.cta.consult': '상담 요청하기',
      
      // Footer
      'footer.company': 'KnowWhere Bridge',
      'footer.description': '전세계 AI·Fintech·IT 생태계 활성화에 기여하는 맞춤형 비즈니스 매칭 전문기업입니다.',
      'footer.contact': '연락처',
      'footer.privacy': '개인정보처리방침',
      'footer.terms': '이용약관',
      'footer.copyright': 'Copyright 2024. 노웨어 브릿지 Co. All rights reserved.',
    },
    en: {
      // Service name - shortened
      'service.name': 'KnowWhere Bridge',
      
      // Auth
      'auth.title': 'KnowWhere Bridge',
      'auth.subtitle': 'Welcome to the Global Business Matching Platform',
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.login.button': 'Login',
      'auth.signup.button': 'Sign Up',
      
      // Navigation
      'nav.home': 'Home',
      'nav.services': 'Services',
      'nav.about': 'About',
      'nav.login': 'Login',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',
      
      // Homepage
      'home.hero.badge': 'AI-Powered Global Business Analysis',
      'home.hero.title': 'The New Standard for\nGlobal Business Matching',
      'home.hero.subtitle': 'Smart matching platform connecting companies dreaming of\nglobal expansion with worldwide partners',
      'home.hero.start': 'Start Analysis',
      'home.hero.explore': 'Explore Services',
      
      // Services page
      'services.hero.badge': 'AI-Powered Global Business Matching',
      'services.hero.title.highlight': 'World-Class',
      'services.hero.title.main': 'AI Market Analysis Service',
      'services.hero.subtitle': 'Match optimal global partners, investors, and customers with Goldman Sachs-level market analysis reports.',
      'services.hero.cta': 'Start Free Analysis',
      'services.cta.consult': 'Request Consultation',
      
      // Footer
      'footer.company': 'KnowWhere Bridge',
      'footer.description': 'A specialized business matching company contributing to the activation of global AI, Fintech, and IT ecosystems.',
      'footer.contact': 'Contact',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Service',
      'footer.copyright': 'Copyright 2024. Nowhere Bridge Co. All rights reserved.',
    },
    ja: {
      // Service name - shortened
      'service.name': 'KnowWhere Bridge',
      
      // Auth
      'auth.title': 'KnowWhere Bridge',
      'auth.subtitle': 'グローバルビジネスマッチングプラットフォームへようこそ',
      'auth.login': 'ログイン',
      'auth.signup': '会員登録',
      'auth.email': 'メールアドレス',
      'auth.password': 'パスワード',
      'auth.login.button': 'ログイン',
      'auth.signup.button': '会員登録',
      
      // Navigation
      'nav.home': 'ホーム',
      'nav.services': 'サービス',
      'nav.about': '会社概要',
      'nav.login': 'ログイン',
      'nav.dashboard': 'ダッシュボード',
      'nav.logout': 'ログアウト',
      
      // Homepage
      'home.hero.badge': 'AI基盤グローバルビジネス分析',
      'home.hero.title': 'グローバルビジネスマッチングの\n新基準',
      'home.hero.subtitle': '海外進出を夢見る企業と世界のパートナーを\n繋ぐスマートマッチングプラットフォーム',
      'home.hero.start': '分析開始',
      'home.hero.explore': 'サービス探索',
      
      // Services page
      'services.hero.badge': 'AI基盤グローバルビジネスマッチング',
      'services.hero.title.highlight': '世界最高水準の',
      'services.hero.title.main': 'AI市場分析サービス',
      'services.hero.subtitle': 'Goldman Sachs級市場分析レポートで最適なグローバルパートナー、投資家、顧客をマッチングします。',
      'services.hero.cta': '無料分析開始',
      'services.cta.consult': '相談リクエスト',
      
      // Footer
      'footer.company': 'KnowWhere Bridge',
      'footer.description': '全世界AI・Fintech・IT生態系活性化に貢献するカスタムビジネスマッチング専門企業です。',
      'footer.contact': '連絡先',
      'footer.privacy': 'プライバシーポリシー',
      'footer.terms': '利用規約',
      'footer.copyright': 'Copyright 2024. Nowhere Bridge Co. All rights reserved.',
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};