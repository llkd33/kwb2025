import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Users, Award } from "lucide-react";

export function CompanyBrief() {
  return (
    <section className="py-24 bg-gradient-card">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <Badge variant="outline" className="mb-6">
            회사소개
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            전세계 AI·Fintech·IT 생태계 활성화에 기여하는
            <br />
            <span className="text-primary">KnowWhere Bridge Matching 서비스</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            맞춤형 비즈니스 매칭 전문기업으로, 자체 개발한 AI 플랫폼과 글로벌 전문가 그룹을 활용하여 
            여러분의 최적의 비즈니스 엠베서더 역할을 합니다.
          </p>

          {/* Key Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">글로벌 네트워크</h3>
                <p className="text-muted-foreground">전 세계 AI·핀테크·IT 파트너</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">전문가 그룹</h3>
                <p className="text-muted-foreground">검증된 글로벌 비즈니스 전문가</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">AI 플랫폼</h3>
                <p className="text-muted-foreground">자체 개발 AI 분석 시스템</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Button size="lg" className="bg-gradient-primary hover:opacity-90">
            회사소개 자세히 보기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}