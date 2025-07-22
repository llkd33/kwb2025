import { useLanguage } from "@/contexts/LanguageContext";
export function Footer() {
  const { t } = useLanguage();
  return <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{t('service.name')}</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="text-sm text-primary-foreground/80 space-y-1">
                <p>상호명 : (주)노웨어브릿지</p>
                <p>대표 : 홍 동 표</p>
                <p>TEL : 02-525-7121</p>
                <p>EMAIL : sales@knowwherebridge.com</p>
                <p>사업자 등록번호 : 755-88-02896</p>
                <p>주소 : 서울특별시 서초구 서초대로 77길 39, 11층 106호</p>
              </div>
            </div>

            {/* Contact Info */}
            

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">바로가기</h4>
              <div className="space-y-2">
                <a href="/about" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  {t('nav.about')}
                </a>
                <a href="/services" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  {t('nav.services')}
                </a>
                <a href="/dashboard" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </a>
                <a href="/contact" className="block text-primary-foreground/80 hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-primary-foreground/60">
                {t('footer.copyright')}
              </p>
              <div className="flex gap-6 text-sm">
                <a href="/privacy" className="text-primary-foreground/60 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </a>
                <a href="/terms" className="text-primary-foreground/60 hover:text-white transition-colors">
                  {t('footer.terms')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}