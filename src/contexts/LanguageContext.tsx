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
      'nav.menu': '메뉴',
      
      // Homepage
      'home.hero.badge': 'AI 기반 글로벌 비즈니스 분석',
      'home.hero.title': '글로벌 비즈니스 매칭의\n새로운 기준',
      'home.hero.subtitle': '해외진출을 꿈꾸는 기업과 글로벌 파트너를 연결하는\n스마트한 매칭 플랫폼',
      'home.hero.start': '분석 시작하기',
      'home.hero.explore': '서비스 둘러보기',
      'home.hero.cta': '무료 분석 시작하기',
      'home.hero.goldman': 'Goldman Sachs급 시장분석 리포트를 경험하세요.',
      'home.hero.matching_request': '매칭 요청하기',
      'home.hero.global_network': '글로벌 네트워크',
      'home.hero.ai_analysis': 'AI 시장 분석',
      'home.hero.custom_matching': '맞춤형 매칭',
      
      // Company Brief
      'company.brief.badge': '회사소개',
      'company.brief.title': '전세계 AI·Fintech·IT 생태계 활성화에 기여하는',
      'company.brief.subtitle': '맞춤형 비즈니스 매칭 전문기업으로, 자체 개발한 AI 플랫폼과 글로벌 전문가 그룹을 활용하여 여러분의 최적의 비즈니스 엠베서더 역할을 합니다.',
      'company.brief.global_network': '글로벌 네트워크',
      'company.brief.global_partners': '전 세계 AI·핀테크·IT 파트너',
      'company.brief.expert_group': '전문가 그룹',
      'company.brief.verified_experts': '검증된 글로벌 비즈니스 전문가',
      'company.brief.ai_platform': 'AI 플랫폼',
      'company.brief.custom_ai': '자체 개발 AI 분석 시스템',
      'company.brief.learn_more': '회사소개 자세히 보기',
      
      // Features
      'home.features.title': 'KnowWhere Bridge만의 차별화된 AI 분석 시스템',
      'home.features.subtitle': 'KnowWhere Bridge만의 차별화된 AI 분석 시스템으로 글로벌 비즈니스 성공을 앞당기세요.',
      'home.features.core_features': '핵심 기능',
      'home.features.ai.title': '문서 자동 처리',
      'home.features.ai.desc': 'AI가 회사소개서를 자동으로 분석하여 핵심 정보를 추출합니다.',
      'home.features.auto_analysis': 'AI 자동 분석',
      'home.features.auto_analysis_desc': 'GPT와 Perplexity를 활용하여 핵심 비즈니스 요소를 자동으로 추출하고 분석합니다.',
      'home.features.expert.title': '전문가 검토',
      'home.features.expert.desc': '어드민이 AI 분석 결과를 검토하고 보완하여 정확성을 높입니다.',
      'home.features.custom_report': '맞춤형 리포트',
      'home.features.custom_report_desc': 'Goldman Sachs 수준의 전문적인 시장분석 리포트를 마이페이지에서 확인할 수 있습니다.',
      'home.features.global.title': '글로벌 네트워크',
      'home.features.global.desc': '전 세계 파트너사와의 네트워크를 통해 최적의 매칭을 제공합니다.',
      'home.features.security': '보안 & 신뢰성',
      'home.features.security_desc': '사업자등록증 검증과 어드민 승인 시스템으로 신뢰할 수 있는 비즈니스 환경을 제공합니다.',
      
      // Process
      'home.process.title': '간단한 6단계로 완성되는',
      'home.process.subtitle': '전문 분석 리포트',
      'home.process.desc': '복잡한 절차 없이 빠르고 정확한 해외진출 분석을 경험하세요.',
      'home.process.step1': '회원가입',
      'home.process.step1_desc': '소셜 로그인 또는 이메일로 간편 가입',
      'home.process.step2': '사업자등록증 제출',
      'home.process.step2_desc': '사업자등록증 업로드 후 어드민 승인 대기',
      'home.process.step3': '회사정보 제출',
      'home.process.step3_desc': '회사소개서 업로드 및 진출 희망 국가 선택',
      'home.process.step4': 'AI 분석',
      'home.process.step4_desc': 'GPT/Perplexity 기반 자동 분석 수행',
      'home.process.step5': '전문가 검토',
      'home.process.step5_desc': '어드민이 분석 결과 검토 및 보완',
      'home.process.step6': '리포트 제공',
      'home.process.step6_desc': '마이페이지에서 최종 분석 리포트 확인',
      
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
      'nav.menu': 'Menu',
      
      // Homepage
      'home.hero.badge': 'AI-Powered Global Business Analysis',
      'home.hero.title': 'The New Standard for\nGlobal Business Matching',
      'home.hero.subtitle': 'Smart matching platform connecting companies dreaming of\nglobal expansion with worldwide partners',
      'home.hero.start': 'Start Analysis',
      'home.hero.explore': 'Explore Services',
      'home.hero.cta': 'Start Free Analysis',
      'home.hero.goldman': 'Experience Goldman Sachs-level market analysis reports.',
      'home.hero.matching_request': 'Request Matching',
      'home.hero.global_network': 'Global Network',
      'home.hero.ai_analysis': 'AI Market Analysis',
      'home.hero.custom_matching': 'Custom Matching',
      
      // Company Brief
      'company.brief.badge': 'About Us',
      'company.brief.title': 'Contributing to the activation of global AI·Fintech·IT ecosystems',
      'company.brief.subtitle': 'A specialized business matching company that serves as your optimal business ambassador using our proprietary AI platform and global expert group.',
      'company.brief.global_network': 'Global Network',
      'company.brief.global_partners': 'Worldwide AI·Fintech·IT Partners',
      'company.brief.expert_group': 'Expert Group',
      'company.brief.verified_experts': 'Verified Global Business Experts',
      'company.brief.ai_platform': 'AI Platform',
      'company.brief.custom_ai': 'Proprietary AI Analysis System',
      'company.brief.learn_more': 'Learn More About Us',
      
      // Features
      'home.features.title': 'KnowWhere Bridge\'s Differentiated AI Analysis System',
      'home.features.subtitle': 'Accelerate your global business success with KnowWhere Bridge\'s differentiated AI analysis system.',
      'home.features.core_features': 'Core Features',
      'home.features.ai.title': 'Automated Document Processing',
      'home.features.ai.desc': 'AI automatically analyzes company profiles to extract key information.',
      'home.features.auto_analysis': 'AI Auto Analysis',
      'home.features.auto_analysis_desc': 'Automatically extract and analyze key business elements using GPT and Perplexity.',
      'home.features.expert.title': 'Expert Review',
      'home.features.expert.desc': 'Admins review and enhance AI analysis results to improve accuracy.',
      'home.features.custom_report': 'Custom Report',
      'home.features.custom_report_desc': 'Access professional market analysis reports at Goldman Sachs level on your dashboard.',
      'home.features.global.title': 'Global Network',
      'home.features.global.desc': 'Provide optimal matching through our network with partners worldwide.',
      'home.features.security': 'Security & Reliability',
      'home.features.security_desc': 'Provide a trustworthy business environment with business registration verification and admin approval system.',
      
      // Process
      'home.process.title': 'Professional Analysis Report Completed in',
      'home.process.subtitle': '6 Simple Steps',
      'home.process.desc': 'Experience fast and accurate overseas expansion analysis without complex procedures.',
      'home.process.step1': 'Sign Up',
      'home.process.step1_desc': 'Easy registration with social login or email',
      'home.process.step2': 'Submit Business Registration',
      'home.process.step2_desc': 'Upload business registration and wait for admin approval',
      'home.process.step3': 'Submit Company Info',
      'home.process.step3_desc': 'Upload company profile and select target countries',
      'home.process.step4': 'AI Analysis',
      'home.process.step4_desc': 'Perform automated analysis based on GPT/Perplexity',
      'home.process.step5': 'Expert Review',
      'home.process.step5_desc': 'Admin reviews and enhances analysis results',
      'home.process.step6': 'Report Delivery',
      'home.process.step6_desc': 'Check final analysis report on your dashboard',
      
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
      'nav.menu': 'メニュー',
      
      // Homepage
      'home.hero.badge': 'AI基盤グローバルビジネス分析',
      'home.hero.title': 'グローバルビジネスマッチングの\n新基準',
      'home.hero.subtitle': '海外進出を夢見る企業と世界のパートナーを\n繋ぐスマートマッチングプラットフォーム',
      'home.hero.start': '分析開始',
      'home.hero.explore': 'サービス探索',
      'home.hero.cta': '無料分析開始',
      'home.hero.goldman': 'Goldman Sachs級市場分析レポートを体験してください。',
      'home.hero.matching_request': 'マッチングリクエスト',
      'home.hero.global_network': 'グローバルネットワーク',
      'home.hero.ai_analysis': 'AI市場分析',
      'home.hero.custom_matching': 'カスタムマッチング',
      
      // Company Brief
      'company.brief.badge': '会社概要',
      'company.brief.title': '全世界AI・Fintech・IT生態系活性化に貢献',
      'company.brief.subtitle': 'カスタムビジネスマッチング専門企業として、自社開発AIプラットフォームとグローバル専門家グループを活用して最適なビジネスアンバサダーの役割を果たします。',
      'company.brief.global_network': 'グローバルネットワーク',
      'company.brief.global_partners': '全世界AI・フィンテック・ITパートナー',
      'company.brief.expert_group': '専門家グループ',
      'company.brief.verified_experts': '検証されたグローバルビジネス専門家',
      'company.brief.ai_platform': 'AIプラットフォーム',
      'company.brief.custom_ai': '自社開発AI分析システム',
      'company.brief.learn_more': '会社概要詳細',
      
      // Features
      'home.features.title': 'KnowWhere Bridgeの差別化されたAI分析システム',
      'home.features.subtitle': 'KnowWhere Bridgeの差別化されたAI分析システムでグローバルビジネス成功を加速させましょう。',
      'home.features.core_features': 'コア機能',
      'home.features.ai.title': '文書自動処理',
      'home.features.ai.desc': 'AIが会社概要書を自動分析して核心情報を抽出します。',
      'home.features.auto_analysis': 'AI自動分析',
      'home.features.auto_analysis_desc': 'GPTとPerplexityを活用して核心ビジネス要素を自動抽出・分析します。',
      'home.features.expert.title': '専門家レビュー',
      'home.features.expert.desc': '管理者がAI分析結果をレビューし補完して正確性を高めます。',
      'home.features.custom_report': 'カスタムレポート',
      'home.features.custom_report_desc': 'Goldman Sachs水準の専門的な市場分析レポートをマイページで確認できます。',
      'home.features.global.title': 'グローバルネットワーク',
      'home.features.global.desc': '全世界パートナー企業とのネットワークを通じて最適なマッチングを提供します。',
      'home.features.security': 'セキュリティ・信頼性',
      'home.features.security_desc': '事業者登録証検証と管理者承認システムで信頼できるビジネス環境を提供します。',
      
      // Process
      'home.process.title': '簡単な6段階で完成する',
      'home.process.subtitle': '専門分析レポート',
      'home.process.desc': '複雑な手続きなしに迅速で正確な海外進出分析を体験してください。',
      'home.process.step1': '会員登録',
      'home.process.step1_desc': 'ソーシャルログインまたはメールで簡単登録',
      'home.process.step2': '事業者登録証提出',
      'home.process.step2_desc': '事業者登録証アップロード後管理者承認待機',
      'home.process.step3': '会社情報提出',
      'home.process.step3_desc': '会社概要書アップロードおよび進出希望国選択',
      'home.process.step4': 'AI分析',
      'home.process.step4_desc': 'GPT/Perplexity基盤自動分析実行',
      'home.process.step5': '専門家検討',
      'home.process.step5_desc': '管理者が分析結果検討および補完',
      'home.process.step6': 'レポート提供',
      'home.process.step6_desc': 'マイページで最終分析レポート確認',
      
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