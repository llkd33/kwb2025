import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">KnowWhere Bridge Matching 서비스</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                전세계 AI·Fintech·IT 생태계 활성화에 기여하는 맞춤형 비즈니스 매칭 전문기업입니다. 
                글로벌 시장에서 여러분의 성공적인 비즈니스를 위해 최선을 다하겠습니다.
              </p>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20">
                회사소개서 다운로드
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">연락처</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-medium">이메일</p>
                    <p className="text-sm text-primary-foreground/80">contact@nowherebridge.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-medium">전화</p>
                    <p className="text-sm text-primary-foreground/80">+82-2-1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-medium">주소</p>
                    <p className="text-sm text-primary-foreground/80">
                      서울특별시 강남구 테헤란로<br />
                      123, KnowWhere Bridge Matching 서비스빌딩 10층
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">바로가기</h4>
              <div className="space-y-2">
                <a href="/about" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  회사소개
                </a>
                <a href="/services" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  서비스
                </a>
                <a href="/dashboard" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  대시보드
                </a>
                <a href="/contact" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  문의하기
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-primary-foreground/60">
                © 2024 KnowWhere Bridge Matching 서비스. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="/privacy" className="text-primary-foreground/60 hover:text-white transition-colors">
                  개인정보처리방침
                </a>
                <a href="/terms" className="text-primary-foreground/60 hover:text-white transition-colors">
                  이용약관
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}