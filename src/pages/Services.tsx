import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, CheckCircle2, FileText, Globe, TrendingUp, UserPlus, Upload, Search, FileCheck, Users, Rocket, ChartBar, Shield, Zap, Target, Award, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Services() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const handleStartDemo = () => {
    navigate('/auth');
  };

  const flowSteps = [
    {
      step: 1,
      title: "회원가입 & 승인",
      description: "기업 정보를 등록하고 관리자 승인을 받습니다",
      icon: <CheckCircle2 className="w-6 h-6" />,
      illustration: {
        icon: <UserPlus className="w-24 h-24 text-primary" />,
        bgColor: "bg-blue-50",
        emoji: "👤"
      },
      details: [
        "기업 기본 정보 입력",
        "대표자 및 담당자 정보",
        "사업자등록증 업로드",
        "관리자 검토 및 승인"
      ],
      features: [
        { label: "간편한 회원가입", value: "5분 이내 완료" },
        { label: "보안 인증", value: "SSL 암호화" },
        { label: "승인 시간", value: "24시간 이내" }
      ]
    },
    {
      step: 2,
      title: "서류 업로드",
      description: "필요한 비즈니스 문서들을 업로드합니다",
      icon: <FileText className="w-6 h-6" />,
      illustration: {
        icon: <Upload className="w-24 h-24 text-primary" />,
        bgColor: "bg-green-50",
        emoji: "📄"
      },
      details: [
        "사업자등록증 첨부",
        "회사 소개서 업로드", 
        "제품/서비스 카탈로그",
        "문서 검증 완료"
      ],
      features: [
        { label: "지원 형식", value: "PDF, DOC, PPT" },
        { label: "최대 용량", value: "50MB/파일" },
        { label: "자동 검증", value: "AI OCR 기술" }
      ]
    },
    {
      step: 3,
      title: "AI 분석 요청",
      description: "진출 희망 국가를 선택하고 AI 분석을 요청합니다",
      icon: <Globe className="w-6 h-6" />,
      illustration: {
        icon: <ChartBar className="w-24 h-24 text-primary" />,
        bgColor: "bg-purple-50",
        emoji: "🤖"
      },
      details: [
        "타겟 국가 선택",
        "비즈니스 목표 설정",
        "AI 종합 분석 시작",
        "시장 데이터 수집"
      ],
      features: [
        { label: "분석 모델", value: "GPT-4 & Perplexity" },
        { label: "데이터 소스", value: "실시간 시장 정보" },
        { label: "처리 시간", value: "평균 10분" }
      ]
    },
    {
      step: 4,
      title: "매칭 결과 수령",
      description: "맞춤형 분석 리포트와 매칭 결과를 받습니다",
      icon: <TrendingUp className="w-6 h-6" />,
      illustration: {
        icon: <Award className="w-24 h-24 text-primary" />,
        bgColor: "bg-orange-50",
        emoji: "🎯"
      },
      details: [
        "Goldman Sachs급 분석 리포트",
        "최적 파트너 매칭 리스트",
        "투자자 연결 기회",
        "시장 진출 전략 제안"
      ],
      features: [
        { label: "리포트 분량", value: "30-50 페이지" },
        { label: "매칭 정확도", value: "92% 이상" },
        { label: "후속 지원", value: "3개월 무료" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NB</span>
              </div>
              <span className="text-xl font-bold text-primary">KnowWhere Bridge</span>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Play className="w-4 h-4 mr-2" />
                실제 서비스 화면
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-primary">
                  4단계로 완성하는
                </span>
                <br />
                글로벌 비즈니스 매칭
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                실제 서비스 화면과 함께 각 단계별 프로세스를 확인해보세요.
              </p>
              <Button size="lg" onClick={handleStartDemo} className="bg-gradient-primary hover:opacity-90">
                지금 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Process Timeline */}
        <section className="py-8 bg-background sticky top-16 z-40 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 md:gap-8 overflow-x-auto">
              {flowSteps.map((step, index) => (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(step.step)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: activeStep === step.step ? 'rgb(var(--primary))' : 'transparent',
                    color: activeStep === step.step ? 'white' : 'rgb(var(--muted-foreground))',
                    border: activeStep === step.step ? 'none' : '1px solid rgb(var(--border))'
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeStep === step.step ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {step.step}
                  </div>
                  <span className="hidden md:inline font-medium">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Service Flow Steps with Screenshots */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {flowSteps.map((step, index) => (
              <div 
                key={step.step} 
                className={`transition-all duration-500 ${
                  activeStep === step.step ? 'opacity-100' : 'opacity-0 hidden'
                }`}
              >
                <div className="max-w-6xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Illustration */}
                    <div className="order-2 lg:order-1">
                      <Card className={`overflow-hidden shadow-2xl ${step.illustration.bgColor} p-16 flex items-center justify-center`}>
                        <div className="text-center space-y-6">
                          <div className="text-6xl mb-4">{step.illustration.emoji}</div>
                          {step.illustration.icon}
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                            <p className="text-gray-600 max-w-xs mx-auto">
                              {step.step === 1 && "간편한 가입 절차로 빠르게 시작하세요"}
                              {step.step === 2 && "필요한 문서를 안전하게 업로드하세요"}
                              {step.step === 3 && "AI가 최적의 매칭을 찾아드립니다"}
                              {step.step === 4 && "맞춤형 분석 결과를 받아보세요"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Right: Content */}
                    <div className="order-1 lg:order-2 space-y-6">
                      {/* Step Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                          {step.icon}
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            STEP {step.step}
                          </Badge>
                          <h2 className="text-3xl md:text-4xl font-bold">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-xl text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        {step.features.map((feature, featureIndex) => (
                          <Card key={featureIndex} className="p-4 text-center bg-muted/50">
                            <p className="text-sm text-muted-foreground mb-1">{feature.label}</p>
                            <p className="font-bold text-primary">{feature.value}</p>
                          </Card>
                        ))}
                      </div>

                      {/* CTA Button */}
                      {step.step === 1 && (
                        <Button onClick={handleStartDemo} size="lg" className="w-full sm:w-auto">
                          회원가입 시작하기
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                왜 KnowWhere Bridge인가?
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <Card className="p-6 hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">🌍</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">글로벌 네트워크</h3>
                  <p className="text-muted-foreground">
                    50개국 이상의 검증된 파트너사와 투자자 네트워크
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="secondary">🇺🇸 USA</Badge>
                    <Badge variant="secondary">🇯🇵 JPN</Badge>
                    <Badge variant="secondary">🇩🇪 DEU</Badge>
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">🤖</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI 기반 분석</h3>
                  <p className="text-muted-foreground">
                    GPT-4와 Perplexity를 활용한 실시간 시장 분석
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="secondary">🧪 실시간</Badge>
                    <Badge variant="secondary">📊 빅데이터</Badge>
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">🏆</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">검증된 성과</h3>
                  <p className="text-muted-foreground">
                    92% 이상의 매칭 성공률과 고객 만족도
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="secondary">⭐ 4.9/5</Badge>
                    <Badge variant="secondary">👥 1,000+</Badge>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작해보세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Goldman Sachs급 AI 분석으로 글로벌 비즈니스 기회를 발견하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartDemo}
                className="bg-background text-primary hover:bg-background/90"
              >
                무료 분석 시작하기
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                onClick={() => window.open('https://open.kakao.com/o/sNxhm3he', '_blank')}
              >
                상담 요청하기
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}