import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Globe, 
  BarChart3, 
  Users, 
  Mail, 
  CheckCircle,
  Upload,
  Search,
  Shield
} from "lucide-react";

export function FeaturesSection() {
  const { t } = useLanguage();
  const features = [
    {
      icon: Upload,
      title: t('home.features.ai.title'),
      description: t('home.features.ai.desc'),
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "AI 자동 분석",
      description: "GPT와 Perplexity를 활용하여 핵심 비즈니스 요소를 자동으로 추출하고 분석합니다.",
      color: "text-emerald-600"
    },
    {
      icon: Users,
      title: t('home.features.expert.title'),
      description: t('home.features.expert.desc'),
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: "맞춤형 리포트",
      description: "Goldman Sachs 수준의 전문적인 시장분석 리포트를 마이페이지에서 확인할 수 있습니다.",
      color: "text-orange-600"
    },
    {
      icon: Globe,
      title: t('home.features.global.title'),
      description: t('home.features.global.desc'),
      color: "text-cyan-600"
    },
    {
      icon: Shield,
      title: "보안 & 신뢰성",
      description: "사업자등록증 검증과 어드민 승인 시스템으로 신뢰할 수 있는 비즈니스 환경을 제공합니다.",
      color: "text-red-600"
    }
  ];

  const process = [
    { step: "01", title: "회원가입", desc: "소셜 로그인 또는 이메일로 간편 가입" },
    { step: "02", title: "사업자등록증 제출", desc: "사업자등록증 업로드 후 어드민 승인 대기" },
    { step: "03", title: "회사정보 제출", desc: "회사소개서 업로드 및 진출 희망 국가 선택" },
    { step: "04", title: "AI 분석", desc: "GPT/Perplexity 기반 자동 분석 수행" },
    { step: "05", title: "전문가 검토", desc: "어드민이 분석 결과 검토 및 보완" },
    { step: "06", title: "리포트 제공", desc: "마이페이지에서 최종 분석 리포트 확인" }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              핵심 기능
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              KnowWhere Bridge Matching 서비스만의 차별화된 AI 분석 시스템으로 글로벌 비즈니스 성공을 앞당기세요.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-premium transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Process Flow */}
          <div className="bg-gradient-card rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                간단한 6단계로 완성되는
                <br />
                <span className="text-primary">전문 분석 리포트</span>
              </h3>
              <p className="text-muted-foreground">
                복잡한 절차 없이 빠르고 정확한 해외진출 분석을 경험하세요.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  
                  {/* Connector Line */}
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform translate-x-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}