import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Award, 
  Globe, 
  Briefcase,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";

export function CompanyIntro() {
  const achievements = [
    { icon: Building2, title: "한국핀테크산업협회", subtitle: "부회장 & 해외진출 추진위원장" },
    { icon: Globe, title: "아시아 핀테크 얼라이언스", subtitle: "Co-Founder" },
    { icon: Briefcase, title: "유럽상장사 Facephi", subtitle: "아시아대표" },
    { icon: TrendingUp, title: "삼성전자", subtitle: "모바일사업부 & 종합기술원" },
  ];

  const expertise = [
    "ICT 국제표준화전문가",
    "안면인식 기술 특허 보유",
    "비즈니스 매칭 국제특허출원",
    "대통령 방미 경제사절단 참석"
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>
      
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 border border-blue-200/50 backdrop-blur-sm text-base font-semibold">
              회사소개
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 leading-tight">
              <span className="block mb-2">전세계 AI·Fintech·IT</span>
              <span className="block mb-2">생태계 활성화에 기여하는</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                KnowWhere Bridge
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              글로벌 비즈니스 매칭 전문기업으로 <br className="hidden sm:block" />
              <span className="font-semibold text-slate-800">AI 기반 혁신 솔루션</span>을 제공합니다
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 sm:mb-20">
            {/* Enhanced CEO Profile */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 flex-shrink-0">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      홍동표 대표이사
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      글로벌 AI·Fintech·IT 분야<br className="hidden sm:block" />
                      비즈니스 협업플랫폼 기업<br />
                      <span className="font-semibold text-blue-700">㈜KnowWhere Bridge Founder & CEO</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-blue-800">한국핀테크산업협회 부회장</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-purple-800">아시아 핀테크 얼라이언스 Co-Founder</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Key Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  주요 경력
                </h3>
                <div className="space-y-4">
                  {achievements.map((item, index) => (
                    <div key={index} className="group p-4 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all duration-300 border border-slate-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-purple-100 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0">
                          <item.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 mb-1">{item.title}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expertise Grid */}
          <Card className="shadow-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                전문 분야 & 성과
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {expertise.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CEO Message */}
          <Card className="shadow-card mt-12">
            <CardContent className="p-8 bg-gradient-primary text-white">
              <h3 className="text-2xl font-bold mb-6">CEO 인사말</h3>
              <div className="space-y-4 text-white/90 leading-relaxed">
                <p>
                  안녕하세요, KnowWhere Bridge 창업자 홍동표입니다. 저희 홈페이지를 방문해 주신 여러분께 진심으로 감사드립니다.
                </p>
                <p>
                  KnowWhere Bridge는 국내외 AI, 핀테크, IT 분야의 기업들에게 맞춤형 비즈니스 매칭 서비스를 제공하는 전문기업입니다. 
                  저희 회사는 자체 개발한 AI 플랫폼과 글로벌 전문가 그룹을 활용하여, 여러분의 최적의 비즈니스 엠베서더로서 역할을 하고 있습니다.
                </p>
                <p>
                  KnowWhere Bridge의 이름처럼, 필요한 고객을 찾아내고 (KnowWhere), 연결(Bridge)함으로써 전 세계 AI, 핀테크, IT 생태계를 활성화하는 데 기여하고자 합니다. 
                  이 과정에서 저 또한 여러분의 멘토로서 함께하며 지원을 아끼지 않을 것입니다.
                </p>
                <p className="font-medium">
                  저희와 함께 글로벌 시장에서 성공적인 비즈니스를 이루시길 기대합니다. 여러분의 성장과 성공을 위해 최선을 다할 것을 약속드립니다.
                </p>
                <p className="text-right font-bold text-xl mt-6">
                  대표이사 홍동표
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}