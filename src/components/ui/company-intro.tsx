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
    <section className="py-24 bg-gradient-card">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              회사소개
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              전세계 AI·Fintech·IT 생태계 활성화에 기여하는
              <br />
              <span className="text-primary">KnowWhere Bridge</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              맞춤형 비즈니스 매칭 전문기업 KnowWhere Bridge입니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* CEO Profile */}
            <Card className="shadow-card">
              <CardContent className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">홍동표 대표이사</h3>
                    <p className="text-muted-foreground">
                      글로벌 AI·Fintech·IT 분야 비즈니스 협업플랫폼 기업
                      <br />
                      ㈜KnowWhere Bridge Founder & CEO
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">한국핀테크산업협회 부회장</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-medium">아시아 핀테크 얼라이언스 Co-Founder</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Achievements */}
            <Card className="shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" />
                  주요 경력
                </h3>
                <div className="grid gap-4">
                  {achievements.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <item.icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
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