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
      // Auth
      'auth.title': 'KnowWhere Bridge Matching 서비스',
      'auth.subtitle': '해외진출 매칭 플랫폼에 오신 것을 환영합니다',
      'auth.login': '로그인',
      'auth.signup': '회원가입',
      'auth.email': '이메일',
      'auth.password': '비밀번호',
      'auth.login.button': '로그인',
      'auth.login.loading': '로그인 중...',
      'auth.signup.button': '회원가입',
      'auth.signup.loading': '회원가입 중...',
      'auth.signup.complete': '회원가입 완료',
      'auth.signup.complete.message': '회원가입이 완료되었습니다. 관리자 승인 후 이메일로 알려드리겠습니다.',
      'auth.confirm': '확인',
      
      // Company fields
      'company.name': '회사명',
      'company.ceo': '대표자명',
      'company.manager': '담당자명',
      'company.position': '담당자 직책',
      'company.phone': '연락처',
      'company.industry': '업종',
      'company.country': '본사 국가',
      'company.city': '본사 도시',
      'company.year': '설립연도',
      'company.employees': '직원 수',
      'company.website': '회사 웹사이트',
      'company.products': '주요 제품/서비스',
      'company.target': '타겟 시장',
      'company.document': '사업자등록증',
      'company.document.note': 'PDF, JPG, PNG 파일만 업로드 가능합니다.',
      
      // Industries
      'industry.manufacturing': '제조업',
      'industry.it': 'IT/소프트웨어',
      'industry.bio': '바이오/헬스케어',
      'industry.chemical': '화학',
      'industry.food': '식품',
      'industry.fashion': '패션/뷰티',
      'industry.other': '기타',
      
      // Countries
      'country.korea': '한국',
      'country.japan': '일본',
      'country.singapore': '싱가포르',
      'country.taiwan': '대만',
      'country.hongkong': '홍콩',
      'country.philippines': '필리핀',
      'country.indonesia': '인도네시아',
      'country.malaysia': '말레이시아',
      'country.vietnam': '베트남',
      'country.thailand': '태국',
      'country.india': '인도',
      'country.other.asia': '기타 아시아',
      'country.uae': 'UAE',
      'country.saudi': '사우디아라비아',
      'country.other.middle': '기타 중동',
      'country.usa': '미국',
      'country.canada': '캐나다',
      'country.other.north': '기타 북미',
      'country.germany': '독일',
      'country.uk': '영국',
      'country.france': '프랑스',
      'country.italy': '이탈리아',
      'country.spain': '스페인',
      'country.netherlands': '네덜란드',
      'country.other.europe': '기타 유럽',
      'country.australia': '호주',
      'country.newzealand': '뉴질랜드',
      
      // Employee counts
      'employees.1-10': '1-10명',
      'employees.11-50': '11-50명',
      'employees.51-100': '51-100명',
      'employees.101-500': '101-500명',
      'employees.500+': '500명 이상',
      
      // Navigation
      'nav.home': '홈',
      'nav.services': '서비스',
      'nav.about': '회사소개',
      'nav.login': '로그인',
      'nav.dashboard': '대시보드',
      'nav.logout': '로그아웃',
      
      // Homepage
      'home.hero.title': '글로벌 비즈니스 매칭의\n새로운 기준',
      'home.hero.subtitle': '해외진출을 꿈꾸는 기업과 글로벌 파트너를 연결하는\n스마트한 매칭 플랫폼',
      'home.hero.cta': '무료 매칭 신청',
      'home.features.title': '왜 KnowWhere Bridge Matching 서비스를 선택해야 할까요?',
      'home.features.ai.title': 'AI 기반 매칭',
      'home.features.ai.desc': '인공지능이 분석한 정확한 파트너 매칭',
      'home.features.global.title': '글로벌 네트워크',
      'home.features.global.desc': '전 세계 검증된 파트너사 네트워크',
      'home.features.expert.title': '전문가 지원',
      'home.features.expert.desc': '해외진출 전문가의 1:1 컨설팅',
      
      // Required field
      'required': '*',
      'select.placeholder': '선택하세요',
    },
    en: {
      // Auth
      'auth.title': 'KnowWhere Bridge Matching Service',
      'auth.subtitle': 'Welcome to the Global Business Matching Platform',
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.login.button': 'Login',
      'auth.login.loading': 'Logging in...',
      'auth.signup.button': 'Sign Up',
      'auth.signup.loading': 'Signing up...',
      'auth.signup.complete': 'Registration Complete',
      'auth.signup.complete.message': 'Registration completed. You will be notified by email after admin approval.',
      'auth.confirm': 'Confirm',
      
      // Company fields
      'company.name': 'Company Name',
      'company.ceo': 'CEO Name',
      'company.manager': 'Manager Name',
      'company.position': 'Manager Position',
      'company.phone': 'Phone Number',
      'company.industry': 'Industry',
      'company.country': 'Headquarters Country',
      'company.city': 'Headquarters City',
      'company.year': 'Founded Year',
      'company.employees': 'Number of Employees',
      'company.website': 'Company Website',
      'company.products': 'Main Products/Services',
      'company.target': 'Target Market',
      'company.document': 'Business Registration',
      'company.document.note': 'Only PDF, JPG, PNG files are allowed.',
      
      // Industries
      'industry.manufacturing': 'Manufacturing',
      'industry.it': 'IT/Software',
      'industry.bio': 'Bio/Healthcare',
      'industry.chemical': 'Chemical',
      'industry.food': 'Food',
      'industry.fashion': 'Fashion/Beauty',
      'industry.other': 'Other',
      
      // Countries
      'country.korea': 'Korea',
      'country.japan': 'Japan',
      'country.singapore': 'Singapore',
      'country.taiwan': 'Taiwan',
      'country.hongkong': 'Hong Kong',
      'country.philippines': 'Philippines',
      'country.indonesia': 'Indonesia',
      'country.malaysia': 'Malaysia',
      'country.vietnam': 'Vietnam',
      'country.thailand': 'Thailand',
      'country.india': 'India',
      'country.other.asia': 'Other Asia',
      'country.uae': 'UAE',
      'country.saudi': 'Saudi Arabia',
      'country.other.middle': 'Other Middle East',
      'country.usa': 'USA',
      'country.canada': 'Canada',
      'country.other.north': 'Other North America',
      'country.germany': 'Germany',
      'country.uk': 'UK',
      'country.france': 'France',
      'country.italy': 'Italy',
      'country.spain': 'Spain',
      'country.netherlands': 'Netherlands',
      'country.other.europe': 'Other Europe',
      'country.australia': 'Australia',
      'country.newzealand': 'New Zealand',
      
      // Employee counts
      'employees.1-10': '1-10 employees',
      'employees.11-50': '11-50 employees',
      'employees.51-100': '51-100 employees',
      'employees.101-500': '101-500 employees',
      'employees.500+': '500+ employees',
      
      // Navigation
      'nav.home': 'Home',
      'nav.services': 'Services',
      'nav.about': 'About',
      'nav.login': 'Login',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',
      
      // Homepage
      'home.hero.title': 'The New Standard for\nGlobal Business Matching',
      'home.hero.subtitle': 'Smart matching platform connecting companies dreaming of\nglobal expansion with worldwide partners',
      'home.hero.cta': 'Apply for Free Matching',
      'home.features.title': 'Why Choose KnowWhere Bridge Matching Service?',
      'home.features.ai.title': 'AI-Based Matching',
      'home.features.ai.desc': 'Accurate partner matching analyzed by AI',
      'home.features.global.title': 'Global Network',
      'home.features.global.desc': 'Verified partner network worldwide',
      'home.features.expert.title': 'Expert Support',
      'home.features.expert.desc': '1:1 consulting by global expansion experts',
      
      // Required field
      'required': '*',
      'select.placeholder': 'Select',
    },
    ja: {
      // Auth
      'auth.title': 'KnowWhere Bridge Matching サービス',
      'auth.subtitle': 'グローバルビジネスマッチングプラットフォームへようこそ',
      'auth.login': 'ログイン',
      'auth.signup': '会員登録',
      'auth.email': 'メールアドレス',
      'auth.password': 'パスワード',
      'auth.login.button': 'ログイン',
      'auth.login.loading': 'ログイン中...',
      'auth.signup.button': '会員登録',
      'auth.signup.loading': '登録中...',
      'auth.signup.complete': '会員登録完了',
      'auth.signup.complete.message': '会員登録が完了しました。管理者承認後、メールでお知らせします。',
      'auth.confirm': '確認',
      
      // Company fields
      'company.name': '会社名',
      'company.ceo': '代表者名',
      'company.manager': '担当者名',
      'company.position': '担当者役職',
      'company.phone': '連絡先',
      'company.industry': '業種',
      'company.country': '本社所在国',
      'company.city': '本社所在都市',
      'company.year': '設立年',
      'company.employees': '従業員数',
      'company.website': '会社ウェブサイト',
      'company.products': '主要製品・サービス',
      'company.target': 'ターゲット市場',
      'company.document': '事業者登録証',
      'company.document.note': 'PDF、JPG、PNGファイルのみアップロード可能です。',
      
      // Industries
      'industry.manufacturing': '製造業',
      'industry.it': 'IT・ソフトウェア',
      'industry.bio': 'バイオ・ヘルスケア',
      'industry.chemical': '化学',
      'industry.food': '食品',
      'industry.fashion': 'ファッション・美容',
      'industry.other': 'その他',
      
      // Countries
      'country.korea': '韓国',
      'country.japan': '日本',
      'country.singapore': 'シンガポール',
      'country.taiwan': '台湾',
      'country.hongkong': '香港',
      'country.philippines': 'フィリピン',
      'country.indonesia': 'インドネシア',
      'country.malaysia': 'マレーシア',
      'country.vietnam': 'ベトナム',
      'country.thailand': 'タイ',
      'country.india': 'インド',
      'country.other.asia': 'その他アジア',
      'country.uae': 'UAE',
      'country.saudi': 'サウジアラビア',
      'country.other.middle': 'その他中東',
      'country.usa': 'アメリカ',
      'country.canada': 'カナダ',
      'country.other.north': 'その他北米',
      'country.germany': 'ドイツ',
      'country.uk': 'イギリス',
      'country.france': 'フランス',
      'country.italy': 'イタリア',
      'country.spain': 'スペイン',
      'country.netherlands': 'オランダ',
      'country.other.europe': 'その他ヨーロッパ',
      'country.australia': 'オーストラリア',
      'country.newzealand': 'ニュージーランド',
      
      // Employee counts
      'employees.1-10': '1-10名',
      'employees.11-50': '11-50名',
      'employees.51-100': '51-100名',
      'employees.101-500': '101-500名',
      'employees.500+': '500名以上',
      
      // Navigation
      'nav.home': 'ホーム',
      'nav.services': 'サービス',
      'nav.about': '会社概要',
      'nav.login': 'ログイン',
      'nav.dashboard': 'ダッシュボード',
      'nav.logout': 'ログアウト',
      
      // Homepage
      'home.hero.title': 'グローバルビジネスマッチングの\n新基準',
      'home.hero.subtitle': '海外進出を夢見る企業と世界のパートナーを\n繋ぐスマートマッチングプラットフォーム',
      'home.hero.cta': '無料マッチング申請',
      'home.features.title': 'なぜKnowWhere Bridge Matching サービスを選ぶべきか？',
      'home.features.ai.title': 'AI基盤マッチング',
      'home.features.ai.desc': 'AIが分析した正確なパートナーマッチング',
      'home.features.global.title': 'グローバルネットワーク',
      'home.features.global.desc': '世界中の検証済みパートナー企業ネットワーク',
      'home.features.expert.title': '専門家サポート',
      'home.features.expert.desc': '海外進出専門家による1:1コンサルティング',
      
      // Required field
      'required': '*',
      'select.placeholder': '選択してください',
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