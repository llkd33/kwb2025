import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  const handleStartDemo = () => {
    navigate('/auth');
  };

  const flowSteps = [
    {
      step: 1,
      title: "회원가입 & 승인",
      description: "기업 정보를 등록하고 관리자 승인을 받습니다",
      details: [
        "기업 기본 정보 입력",
        "대표자 및 담당자 정보",
        "사업자등록증 업로드",
        "관리자 검토 및 승인"
      ]
    },
    {
      step: 2,
      title: "서류 업로드",
      description: "필요한 비즈니스 문서들을 업로드합니다",
      details: [
        "사업자등록증 첨부",
        "회사 소개서 업로드", 
        "제품/서비스 카탈로그",
        "문서 검증 완료"
      ]
    },
    {
      step: 3,
      title: "AI 분석 요청",
      description: "진출 희망 국가를 선택하고 AI 분석을 요청합니다",
      details: [
        "타겟 국가 선택",
        "비즈니스 목표 설정",
        "AI 종합 분석 시작",
        "시장 데이터 수집"
      ]
    },
    {
      step: 4,
      title: "매칭 결과 수령",
      description: "맞춤형 분석 리포트와 매칭 결과를 받습니다",
      details: [
        "Goldman Sachs급 분석 리포트",
        "최적 파트너 매칭 리스트",
        "투자자 연결 기회",
        "시장 진출 전략 제안"
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
                서비스 플로우 데모
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-primary">
                  서비스 이용
                </span>
                <br />
                과정 미리보기
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                실제 서비스 화면으로 4단계 프로세스를 확인해보세요.
              </p>
              <Button size="lg" onClick={handleStartDemo} className="bg-gradient-primary hover:opacity-90">
                지금 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Service Flow Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {flowSteps.map((step, index) => (
                <div key={step.step} className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
                  {/* Step Badge */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    <Badge variant="outline">
                      STEP {step.step}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {step.title}
                      </h2>
                      <p className="text-xl text-muted-foreground mb-6">
                        {step.description}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {step.step === 1 && (
                      <Button onClick={handleStartDemo} variant="outline" className="mt-6">
                        회원가입 시작하기
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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