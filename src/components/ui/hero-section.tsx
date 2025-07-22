import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Globe, Zap } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm mb-8 animate-fade-up">
            <Zap className="w-4 h-4 mr-2 text-accent" />
            <span className="text-sm font-medium">AI 기반 글로벌 비즈니스 분석</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up [animation-delay:200ms]">
            글로벌 AI·핀테크·IT
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
              비즈니스 매칭 플랫폼
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-4 text-white/90 animate-fade-up [animation-delay:400ms]">
            세계 최고 수준의 AI 분석으로 최적의 글로벌 파트너, 투자자, 고객을 매칭합니다.
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-white/80 animate-fade-up [animation-delay:600ms]">
            Goldman Sachs급 시장분석 리포트를 경험하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up [animation-delay:800ms]">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-glow text-lg px-8 py-4 h-14"
            >
              무료 분석 시작하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 h-14"
            >
              서비스 둘러보기
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up [animation-delay:1000ms]">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Globe className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">글로벌 네트워크</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <BarChart3 className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">AI 시장 분석</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">맞춤형 매칭</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}