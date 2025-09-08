import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      service: {
        name: 'KnowWhere Bridge'
      },
      navigation: {
        home: '홈',
        about: '소개',
        services: '서비스',
        login: '로그인',
        signup: '회원가입',
        dashboard: '대시보드',
        admin: '관리자',
        logout: '로그아웃',
        help: '도움말',
        menu: '메뉴'
      },
      home: {
        hero: {
          badge: '글로벌 시장 진출 파트너',
          title: 'AI와 함께하는\n글로벌 진출',
          subtitle: '당신의 비즈니스를 위한\n맞춤형 글로벌 진출 전략',
          description: '현지 규제, 문화, 시장 분석부터 마케팅 전략까지 AI가 제공하는 데이터 기반 인사이트로 성공적인 글로벌 진출을 시작하세요.',
          cta_primary: '무료로 시작하기',
          cta_secondary: '자세히 알아보기',
          cta_matching: '매칭 요청하기',
          features: {
            global_network: {
              title: '글로벌 네트워크',
              description: '150개국 이상의 시장 데이터와 규제 정보를 실시간으로 분석합니다.'
            },
            ai_analysis: {
              title: 'AI 기반 분석',
              description: '빅데이터와 머신러닝으로 최적의 진출 전략을 도출합니다.'
            },
            expert_verification: {
              title: '전문가 검증',
              description: '현지 전문가가 AI 분석 결과를 검증하고 보완합니다.'
            }
          }
        },
        features: {
          core_features: '핵심 기능',
          title: 'KnowWhere Bridge가 제공하는 가치',
          subtitle: 'AI 기술과 글로벌 네트워크를 통해 최적의 해외 진출 전략을 수립하세요',
          ai: {
            title: 'AI 기반 시장 분석',
            desc: '머신러닝을 활용한 실시간 시장 트렌드 분석'
          },
          auto_analysis: '자동 분석 리포트',
          auto_analysis_desc: '24시간 내 맞춤형 시장 진출 리포트 제공',
          expert: {
            title: '현지 전문가 매칭',
            desc: '검증된 현지 전문가와의 1:1 컨설팅'
          },
          custom_report: '맞춤형 보고서',
          custom_report_desc: '귀사의 니즈에 맞춘 상세 분석 보고서',
          global: {
            title: '글로벌 데이터베이스',
            desc: '150개국 이상의 실시간 시장 데이터'
          },
          security: '보안 및 신뢰성',
          security_desc: '엔터프라이즈급 보안과 데이터 보호'
        },
        process: {
          title: '글로벌 진출의 모든 단계를',
          subtitle: '함께합니다',
          desc: 'KnowWhere Bridge와 함께라면 복잡한 해외 진출도 쉽고 빠르게 진행할 수 있습니다.',
          step1: '시장 조사',
          step1_desc: '타겟 시장 분석 및 기회 발굴',
          step2: '전략 수립',
          step2_desc: '맞춤형 진출 전략 및 로드맵 제시',
          step3: '규제 검토',
          step3_desc: '현지 법규 및 규제 사항 분석',
          step4: '파트너 매칭',
          step4_desc: '현지 파트너 및 전문가 연결',
          step5: '실행 지원',
          step5_desc: '진출 과정 전반의 실무 지원',
          step6: '성과 관리',
          step6_desc: '지속적인 모니터링 및 개선'
        }
      },
      company: {
        name: '회사명',
        ceo: '대표자',
        position: '담당자 직위',
        city: '도시',
        year: '설립연도',
        document: '사업자등록증',
        documentNote: '사업자등록증을 PDF, JPG, PNG 형식으로 업로드해주세요',
        website: '웹사이트',
        products: '주요 제품/서비스',
        target: '목표 시장',
        brief: {
          badge: '믿을 수 있는 파트너',
          title: 'KnowWhere Bridge',
          subtitle: '글로벌 비즈니스의 성공적인 첫걸음을 함께합니다',
          global_network: '글로벌 네트워크',
          global_partners: '150개국 이상의 파트너사',
          expert_group: '전문가 그룹',
          verified_experts: '검증된 현지 전문가 3,000명+',
          ai_platform: 'AI 플랫폼',
          custom_ai: '맞춤형 AI 분석 시스템',
          learn_more: '더 알아보기'
        },
        business_info: '사업 정보',
        competitive_advantage: '경쟁 우위',
        country: '국가',
        email: '이메일',
        employees: '직원수',
        industry: '산업',
        manager: '담당자',
        phone: '전화번호',
        products: '제품/서비스',
        registration_info: '등록 정보',
        target_market: '목표 시장'
      },
      footer: {
        company: '노웨어브릿지',
        description: '글로벌 비즈니스 확장을 위한 AI 기반 인사이트와 전문가 네트워크를 제공합니다.',
        contact: '문의하기',
        copyright: '© 2024 KnowWhere Bridge. All rights reserved.',
        privacy: '개인정보처리방침',
        terms: '이용약관',
        business_number: '사업자등록번호',
        links: {
          quick_links: '빠른 링크',
          support: '지원'
        },
        social: {
          follow_us: '팔로우',
          facebook: '페이스북',
          twitter: '트위터',
          linkedin: '링크드인'
        }
      },
      common: {
        back: '뒤로가기'
      },
      errors: {
        404: {
          title: '페이지를 찾을 수 없습니다',
          description: '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
          back_home: '홈으로 돌아가기'
        }
      },
      auth: {
        title: 'KnowWhere Bridge',
        subtitle: '글로벌 시장 진출을 위한 첫걸음을 시작하세요',
        signup: '회원가입',
        signupForm: {
          button: '가입하기',
          loading: '처리 중...',
          complete: '회원가입 완료',
          completeMessage: '회원가입이 완료되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.'
        },
        email: '이메일',
        password: '비밀번호',
        login: '로그인',
        loginForm: {
          button: '로그인',
          loading: '로그인 중...'
        },
        signupTitle: '회원가입',
        loginTitle: '로그인',
        confirm: '확인',
        errors: {
          pending_approval: '승인 대기 중',
          pending_approval_desc: '아직 관리자 승인이 완료되지 않았습니다. 승인 완료 후 이메일로 알려드리겠습니다.',
          login_failed: '로그인 실패',
          wrong_password: '비밀번호가 올바르지 않습니다.',
          login_success: '로그인 성공',
          welcome: '님, 환영합니다!',
          login_error: '로그인 오류',
          document_required: '사업자등록증 필요',
          document_required_desc: '사업자등록증을 업로드해주세요.',
          signup_failed: '회원가입 실패',
          email_exists: '이미 사용 중인 이메일입니다.',
          signup_error: '회원가입 오류'
        }
      },
      select: {
        placeholder: '선택해주세요'
      },
      industry: {
        manufacturing: '제조업',
        it: 'IT/소프트웨어',
        bio: '바이오/헬스케어',
        chemical: '화학',
        food: '식품',
        fashion: '패션/뷰티',
        other: '기타'
      },
      country: {
        korea: '한국',
        japan: '일본',
        singapore: '싱가포르',
        taiwan: '대만',
        hongkong: '홍콩',
        philippines: '필리핀',
        indonesia: '인도네시아',
        malaysia: '말레이시아',
        vietnam: '베트남',
        thailand: '태국',
        india: '인도',
        other: {
          asia: '기타 아시아',
          middle: '기타 중동',
          north: '기타 북미',
          europe: '기타 유럽'
        },
        uae: 'UAE',
        saudi: '사우디아라비아',
        usa: '미국',
        canada: '캐나다',
        germany: '독일',
        uk: '영국',
        france: '프랑스',
        italy: '이탈리아',
        spain: '스페인',
        netherlands: '네덜란드',
        australia: '호주',
        newzealand: '뉴질랜드'
      },
      employees: {
        '1-10': '1-10명',
        '11-50': '11-50명',
        '51-100': '51-100명',
        '101-500': '101-500명',
        '500+': '500명 이상'
      }
    }
  },
  en: {
    translation: {
      service: {
        name: 'KnowWhere Bridge'
      },
      navigation: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard',
        admin: 'Admin',
        logout: 'Logout',
        help: 'Help',
        menu: 'Menu'
      },
      home: {
        hero: {
          badge: 'Global Market Entry Partner',
          title: 'Go Global\nwith AI',
          subtitle: 'Customized global expansion\nstrategies for your business',
          description: 'Start your successful global expansion with data-driven insights from AI, covering everything from local regulations, culture, and market analysis to marketing strategies.',
          cta_primary: 'Get Started Free',
          cta_secondary: 'Learn More',
          cta_matching: 'Request Matching',
          features: {
            global_network: {
              title: 'Global Network',
              description: 'Real-time analysis of market data and regulatory information from over 150 countries.'
            },
            ai_analysis: {
              title: 'AI-Powered Analysis',
              description: 'Derive optimal expansion strategies through big data and machine learning.'
            },
            expert_verification: {
              title: 'Expert Verification',
              description: 'Local experts verify and supplement AI analysis results.'
            }
          }
        },
        features: {
          core_features: 'Core Features',
          title: 'Value Provided by KnowWhere Bridge',
          subtitle: 'Establish optimal global expansion strategies through AI technology and global networks',
          ai: {
            title: 'AI-Based Market Analysis',
            desc: 'Real-time market trend analysis using machine learning'
          },
          auto_analysis: 'Automated Analysis Report',
          auto_analysis_desc: 'Customized market entry report within 24 hours',
          expert: {
            title: 'Local Expert Matching',
            desc: '1:1 consulting with verified local experts'
          },
          custom_report: 'Custom Reports',
          custom_report_desc: 'Detailed analysis reports tailored to your needs',
          global: {
            title: 'Global Database',
            desc: 'Real-time market data from 150+ countries'
          },
          security: 'Security & Reliability',
          security_desc: 'Enterprise-grade security and data protection'
        },
        process: {
          title: 'Every Step of Global Expansion',
          subtitle: 'Together',
          desc: 'With KnowWhere Bridge, even complex international expansion can be done easily and quickly.',
          step1: 'Market Research',
          step1_desc: 'Target market analysis and opportunity discovery',
          step2: 'Strategy Development',
          step2_desc: 'Customized entry strategy and roadmap',
          step3: 'Regulatory Review',
          step3_desc: 'Local laws and regulations analysis',
          step4: 'Partner Matching',
          step4_desc: 'Connect with local partners and experts',
          step5: 'Execution Support',
          step5_desc: 'Practical support throughout the process',
          step6: 'Performance Management',
          step6_desc: 'Continuous monitoring and improvement'
        }
      },
      company: {
        name: 'Company Name',
        ceo: 'CEO',
        position: 'Manager Position',
        city: 'City',
        year: 'Founded Year',
        document: 'Business Registration',
        documentNote: 'Please upload your business registration in PDF, JPG, or PNG format',
        website: 'Website',
        products: 'Main Products/Services',
        target: 'Target Market',
        brief: {
          badge: 'Trusted Partner',
          title: 'KnowWhere Bridge',
          subtitle: 'Taking the successful first step in global business together',
          global_network: 'Global Network',
          global_partners: 'Partners in 150+ countries',
          expert_group: 'Expert Group',
          verified_experts: '3,000+ verified local experts',
          ai_platform: 'AI Platform',
          custom_ai: 'Customized AI analysis system',
          learn_more: 'Learn More'
        },
        business_info: 'Business Information',
        competitive_advantage: 'Competitive Advantage',
        country: 'Country',
        email: 'Email',
        employees: 'Number of Employees',
        industry: 'Industry',
        manager: 'Manager',
        phone: 'Phone',
        products: 'Products/Services',
        registration_info: 'Registration Info',
        target_market: 'Target Market'
      },
      footer: {
        company: 'KnowWhere Bridge',
        description: 'Providing AI-based insights and expert networks for global business expansion.',
        contact: 'Contact Us',
        copyright: '© 2024 KnowWhere Bridge. All rights reserved.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        business_number: 'Business Registration Number',
        links: {
          quick_links: 'Quick Links',
          support: 'Support'
        },
        social: {
          follow_us: 'Follow Us',
          facebook: 'Facebook',
          twitter: 'Twitter',
          linkedin: 'LinkedIn'
        }
      },
      common: {
        back: 'Go Back'
      },
      errors: {
        404: {
          title: 'Page Not Found',
          description: 'The page you requested does not exist or may have been moved.',
          back_home: 'Back to Home'
        }
      },
      auth: {
        title: 'KnowWhere Bridge',
        subtitle: 'Start your first step into global markets',
        signup: 'Sign Up',
        signupForm: {
          button: 'Sign Up',
          loading: 'Processing...',
          complete: 'Registration Complete',
          completeMessage: 'Your registration is complete. You can use the service after admin approval.'
        },
        email: 'Email',
        password: 'Password',
        login: 'Login',
        loginForm: {
          button: 'Login',
          loading: 'Logging in...'
        },
        signupTitle: 'Sign Up',
        loginTitle: 'Login',
        confirm: 'Confirm',
        errors: {
          pending_approval: 'Pending Approval',
          pending_approval_desc: 'Admin approval is pending. We will notify you by email once approved.',
          login_failed: 'Login Failed',
          wrong_password: 'Incorrect password.',
          login_success: 'Login Successful',
          welcome: ', Welcome!',
          login_error: 'Login Error',
          document_required: 'Business Registration Required',
          document_required_desc: 'Please upload your business registration document.',
          signup_failed: 'Sign Up Failed',
          email_exists: 'This email is already in use.',
          signup_error: 'Sign Up Error'
        }
      },
      select: {
        placeholder: 'Please select'
      },
      industry: {
        manufacturing: 'Manufacturing',
        it: 'IT/Software',
        bio: 'Bio/Healthcare',
        chemical: 'Chemical',
        food: 'Food',
        fashion: 'Fashion/Beauty',
        other: 'Other'
      },
      country: {
        korea: 'Korea',
        japan: 'Japan',
        singapore: 'Singapore',
        taiwan: 'Taiwan',
        hongkong: 'Hong Kong',
        philippines: 'Philippines',
        indonesia: 'Indonesia',
        malaysia: 'Malaysia',
        vietnam: 'Vietnam',
        thailand: 'Thailand',
        india: 'India',
        other: {
          asia: 'Other Asia',
          middle: 'Other Middle East',
          north: 'Other North America',
          europe: 'Other Europe'
        },
        uae: 'UAE',
        saudi: 'Saudi Arabia',
        usa: 'USA',
        canada: 'Canada',
        germany: 'Germany',
        uk: 'UK',
        france: 'France',
        italy: 'Italy',
        spain: 'Spain',
        netherlands: 'Netherlands',
        australia: 'Australia',
        newzealand: 'New Zealand'
      },
      employees: {
        '1-10': '1-10',
        '11-50': '11-50',
        '51-100': '51-100',
        '101-500': '101-500',
        '500+': '500+'
      }
    }
  },
  ja: {
    translation: {
      service: {
        name: 'KnowWhere Bridge'
      },
      navigation: {
        home: 'ホーム',
        about: '概要',
        services: 'サービス',
        login: 'ログイン',
        signup: '新規登録',
        dashboard: 'ダッシュボード',
        admin: '管理者',
        logout: 'ログアウト',
        help: 'ヘルプ',
        menu: 'メニュー'
      },
      home: {
        hero: {
          badge: 'グローバル市場進出パートナー',
          title: 'AIと共に\nグローバル進出',
          subtitle: 'あなたのビジネスのための\nカスタマイズされたグローバル進出戦略',
          description: '現地の規制、文化、市場分析からマーケティング戦略まで、AIが提供するデータ駆動型インサイトで成功的なグローバル進出を始めましょう。',
          cta_primary: '無料で始める',
          cta_secondary: '詳しく見る',
          cta_matching: 'マッチングをリクエスト',
          features: {
            global_network: {
              title: 'グローバルネットワーク',
              description: '150か国以上の市場データと規制情報をリアルタイムで分析します。'
            },
            ai_analysis: {
              title: 'AI基盤分析',
              description: 'ビッグデータと機械学習で最適な進出戦略を導出します。'
            },
            expert_verification: {
              title: '専門家検証',
              description: '現地の専門家がAI分析結果を検証し補完します。'
            }
          }
        },
        features: {
          core_features: 'コア機能',
          title: 'KnowWhere Bridgeが提供する価値',
          subtitle: 'AI技術とグローバルネットワークを通じて最適な海外進出戦略を策定',
          ai: {
            title: 'AI基盤市場分析',
            desc: '機械学習を活用したリアルタイム市場トレンド分析'
          },
          auto_analysis: '自動分析レポート',
          auto_analysis_desc: '24時間以内にカスタマイズされた市場進出レポート提供',
          expert: {
            title: '現地専門家マッチング',
            desc: '検証済み現地専門家との1対1コンサルティング'
          },
          custom_report: 'カスタムレポート',
          custom_report_desc: '御社のニーズに合わせた詳細分析レポート',
          global: {
            title: 'グローバルデータベース',
            desc: '150か国以上のリアルタイム市場データ'
          },
          security: 'セキュリティと信頼性',
          security_desc: 'エンタープライズ級セキュリティとデータ保護'
        },
        process: {
          title: 'グローバル進出のすべてのステップを',
          subtitle: '共に',
          desc: 'KnowWhere Bridgeと一緒なら、複雑な海外進出も簡単で迅速に進められます。',
          step1: '市場調査',
          step1_desc: 'ターゲット市場分析と機会発掘',
          step2: '戦略策定',
          step2_desc: 'カスタマイズされた進出戦略とロードマップ',
          step3: '規制レビュー',
          step3_desc: '現地法規と規制事項分析',
          step4: 'パートナーマッチング',
          step4_desc: '現地パートナーと専門家の連携',
          step5: '実行支援',
          step5_desc: '進出プロセス全般の実務支援',
          step6: '成果管理',
          step6_desc: '継続的なモニタリングと改善'
        }
      },
      company: {
        name: '会社名',
        ceo: 'CEO',
        position: '担当者ポジション',
        city: '都市',
        year: '設立年',
        document: '事業者登録',
        documentNote: '事業者登録をPDF、JPG、PNG形式でアップロードしてください',
        website: 'ウェブサイト',
        products: '主要製品/サービス',
        target: 'ターゲット市場',
        brief: {
          badge: '信頼できるパートナー',
          title: 'KnowWhere Bridge',
          subtitle: 'グローバルビジネスの成功的な第一歩を共に',
          global_network: 'グローバルネットワーク',
          global_partners: '150か国以上のパートナー企業',
          expert_group: '専門家グループ',
          verified_experts: '3,000人以上の検証済み現地専門家',
          ai_platform: 'AIプラットフォーム',
          custom_ai: 'カスタマイズAI分析システム',
          learn_more: '詳しく見る'
        },
        business_info: 'ビジネス情報',
        competitive_advantage: '競争優位',
        country: '国',
        email: 'メール',
        employees: '従業員数',
        industry: '産業',
        manager: '担当者',
        phone: '電話番号',
        products: '製品/サービス',
        registration_info: '登録情報',
        target_market: 'ターゲット市場'
      },
      footer: {
        company: 'KnowWhere Bridge',
        description: 'グローバルビジネス拡大のためのAI基盤インサイトと専門家ネットワークを提供します。',
        contact: 'お問い合わせ',
        copyright: '© 2024 KnowWhere Bridge. All rights reserved.',
        privacy: 'プライバシーポリシー',
        terms: '利用規約',
        business_number: '事業者登録番号',
        links: {
          quick_links: 'クイックリンク',
          support: 'サポート'
        },
        social: {
          follow_us: 'フォロー',
          facebook: 'Facebook',
          twitter: 'Twitter',
          linkedin: 'LinkedIn'
        }
      },
      common: {
        back: '戻る'
      },
      errors: {
        404: {
          title: 'ページが見つかりません',
          description: '要求されたページが存在しないか、移動された可能性があります。',
          back_home: 'ホームに戻る'
        }
      },
      auth: {
        title: 'KnowWhere Bridge',
        subtitle: 'グローバル市場への第一歩を始めましょう',
        signup: '新規登録',
        signupForm: {
          button: '登録',
          loading: '処理中...',
          complete: '登録完了',
          completeMessage: '登録が完了しました。管理者の承認後、サービスをご利用いただけます。'
        },
        email: 'メール',
        password: 'パスワード',
        login: 'ログイン',
        loginForm: {
          button: 'ログイン',
          loading: 'ログイン中...'
        },
        signupTitle: '会員登録',
        loginTitle: 'ログイン',
        confirm: '確認',
        errors: {
          pending_approval: '承認待ち',
          pending_approval_desc: '管理者の承認が完了していません。承認後、メールでお知らせします。',
          login_failed: 'ログイン失敗',
          wrong_password: 'パスワードが正しくありません。',
          login_success: 'ログイン成功',
          welcome: 'さん、ようこそ！',
          login_error: 'ログインエラー',
          document_required: '事業者登録が必要',
          document_required_desc: '事業者登録文書をアップロードしてください。',
          signup_failed: '登録失敗',
          email_exists: 'このメールアドレスは既に使用されています。',
          signup_error: '登録エラー'
        }
      },
      select: {
        placeholder: '選択してください'
      },
      industry: {
        manufacturing: '製造業',
        it: 'IT/ソフトウェア',
        bio: 'バイオ/ヘルスケア',
        chemical: '化学',
        food: '食品',
        fashion: 'ファッション/ビューティ',
        other: 'その他'
      },
      country: {
        korea: '韓国',
        japan: '日本',
        singapore: 'シンガポール',
        taiwan: '台湾',
        hongkong: '香港',
        philippines: 'フィリピン',
        indonesia: 'インドネシア',
        malaysia: 'マレーシア',
        vietnam: 'ベトナム',
        thailand: 'タイ',
        india: 'インド',
        other: {
          asia: 'その他アジア',
          middle: 'その他中東',
          north: 'その他北米',
          europe: 'その他ヨーロッパ'
        },
        uae: 'UAE',
        saudi: 'サウジアラビア',
        usa: 'アメリカ',
        canada: 'カナダ',
        germany: 'ドイツ',
        uk: 'イギリス',
        france: 'フランス',
        italy: 'イタリア',
        spain: 'スペイン',
        netherlands: 'オランダ',
        australia: 'オーストラリア',
        newzealand: 'ニュージーランド'
      },
      employees: {
        '1-10': '1-10名',
        '11-50': '11-50名',
        '51-100': '51-100名',
        '101-500': '101-500名',
        '500+': '500名以上'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;