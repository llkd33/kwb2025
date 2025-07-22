import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { 
  Brain, Globe, BarChart3, Shield, Zap, Target, 
  CheckCircle, ArrowRight, Users, Award, TrendingUp
} from "lucide-react";

export default function Services() {
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
              <span className="text-xl font-bold text-primary">KnowWhere Bridge Matching 서비스</span>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI 기반 글로벌 비즈니스 매칭
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  세계 최고 수준의
                </span>
                <br />
                AI 시장분석 서비스
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Goldman Sachs급 시장분석 리포트로 최적의 글로벌 파트너, 투자자, 고객을 매칭합니다.
              </p>
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                무료 분석 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Core Services */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">핵심 서비스</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                AI 기반 분석으로 글로벌 비즈니스 성공을 위한 모든 솔루션을 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle>AI 기업 분석</CardTitle>
                  <CardDescription>
                    고도화된 AI 알고리즘으로 기업의 강점, 시장 포지션, 성장 잠재력을 정밀 분석
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      비즈니스 모델 분석
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      경쟁력 평가
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      성장 가능성 예측
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle>글로벌 시장 분석</CardTitle>
                  <CardDescription>
                    전 세계 시장 동향, 규제 환경, 진출 기회를 실시간으로 분석하여 제공
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      시장 규모 및 성장률
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      규제 환경 분석
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      진출 전략 수립
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle>맞춤형 매칭</CardTitle>
                  <CardDescription>
                    AI 분석 결과를 바탕으로 최적의 파트너, 투자자, 고객을 매칭
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      파트너사 매칭
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      투자자 연결
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      고객 타겟팅
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 KnowWhere Bridge Matching 서비스인가?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                글로벌 비즈니스 성공을 위한 차별화된 장점들을 확인하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Goldman Sachs급 분석</h3>
                <p className="text-gray-600 text-sm">
                  세계 최고 수준의 투자은행 분석 품질을 AI로 구현
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">높은 신뢰성</h3>
                <p className="text-gray-600 text-sm">
                  검증된 데이터와 알고리즘으로 95% 이상의 정확도 보장
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">글로벌 네트워크</h3>
                <p className="text-gray-600 text-sm">
                  전 세계 50개국 이상의 파트너 네트워크 보유
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">실시간 업데이트</h3>
                <p className="text-gray-600 text-sm">
                  시장 변화를 실시간으로 모니터링하여 최신 정보 제공
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">서비스 이용 과정</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                간단한 4단계로 글로벌 비즈니스 성공의 길을 열어보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2">회원가입 & 승인</h3>
                <p className="text-gray-600 text-sm">
                  기업 정보 등록 후 관리자 승인을 받습니다
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2">서류 업로드</h3>
                <p className="text-gray-600 text-sm">
                  사업자등록증과 회사 소개서를 업로드합니다
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold mb-2">AI 분석 요청</h3>
                <p className="text-gray-600 text-sm">
                  진출 희망 국가를 선택하고 AI 분석을 요청합니다
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  4
                </div>
                <h3 className="font-semibold mb-2">매칭 결과 수령</h3>
                <p className="text-gray-600 text-sm">
                  맞춤형 분석 리포트와 매칭 결과를 받습니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 시작하세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              글로벌 시장에서 성공할 수 있는 기회를 놓치지 마세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Award className="w-5 h-5 mr-2" />
                무료 분석 신청
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-transparent hover:bg-white/10"
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