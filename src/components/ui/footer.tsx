import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const { t, language } = useLanguage();
  
  const companyInfo = {
    ko: {
      name: "(주)노웨어브릿지",
      ceo: "홍 동 표",
      phone: "02-525-7121",
      email: "sales@knowwherebridge.com",
      businessNumber: "755-88-02896",
      address: "서울특별시 서초구 서초대로 77길 39, 11층 106호"
    },
    en: {
      name: "Nowhere Bridge Co., Ltd.",
      ceo: "Hong Dong Pyo",
      phone: "+82-2-525-7121",
      email: "sales@knowwherebridge.com",
      businessNumber: "755-88-02896",
      address: "106, 11F, 39 Seocho-daero 77-gil, Seocho-gu, Seoul, Korea"
    },
    ja: {
      name: "株式会社ノーウェアブリッジ",
      ceo: "ホン・ドンピョ",
      phone: "+82-2-525-7121",
      email: "sales@knowwherebridge.com",
      businessNumber: "755-88-02896",
      address: "韓国ソウル特別市瑞草区瑞草大路77ギル39、11階106号"
    }
  };

  const currentInfo = companyInfo[language] || companyInfo.ko;

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KB</span>
                </div>
                <h3 className="text-2xl font-bold">{t('footer.company')}</h3>
              </div>
              
              <p className="text-blue-200/90 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              
              <div className="space-y-3 text-sm text-blue-200/80">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>{currentInfo.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-400" />
                  <span>CEO: {currentInfo.ceo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>{currentInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>{currentInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>{currentInfo.address}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                {t('footer.links.quick_links', 'Quick Links')}
              </h4>
              <div className="space-y-3">
                <Link 
                  to="/about" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('navigation.about')}
                </Link>
                <Link 
                  to="/services" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('navigation.services')}
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('footer.contact')}
                </Link>
              </div>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                {t('footer.links.support', 'Support')}
              </h4>
              <div className="space-y-3">
                <Link 
                  to="/help" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('navigation.help')}
                </Link>
                <Link 
                  to="/privacy" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('footer.privacy')}
                </Link>
                <Link 
                  to="/terms" 
                  className="block text-blue-200/80 hover:text-white transition-colors hover:translate-x-1 transform duration-200"
                >
                  {t('footer.terms')}
                </Link>
              </div>
              
              {/* Social Links */}
              <div className="mt-8">
                <h5 className="text-sm font-semibold mb-4 text-white">
                  {t('footer.social.follow_us', 'Follow Us')}
                </h5>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/40 transition-colors"
                    aria-label={t('footer.social.facebook')}
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/40 transition-colors"
                    aria-label={t('footer.social.twitter')}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/40 transition-colors"
                    aria-label={t('footer.social.linkedin')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-blue-200/60">
                {t('footer.copyright')}
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-200/60">
                <span>{t('footer.business_number', 'Business Registration')}: {currentInfo.businessNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}