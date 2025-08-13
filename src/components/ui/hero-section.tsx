import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Globe, Zap, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const company = localStorage.getItem('currentCompany');
      setIsLoggedIn(!!company);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  }, []);

  const handleStartAnalysis = () => {
    if (isLoggedIn) {
      navigate('/matching-request');
    } else {
      navigate('/auth');
    }
  };

  const handleExploreServices = () => {
    navigate('/services');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center text-white">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full border border-blue-400/30 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              {t('home.hero.badge')}
            </span>
          </div>

          {/* Main Heading with Enhanced Typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            {t('home.hero.title').split('\n').map((line, index) => (
              <span key={index} className={index === 0 ? "block mb-2" : "block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"}>
                {line}
              </span>
            ))}
          </h1>

          {/* Enhanced Subtitle */}
          <div className="space-y-4 mb-12">
            <p className="text-xl sm:text-2xl md:text-3xl text-blue-100/90 font-light">
              {t('home.hero.subtitle').split('\n').map((line, index) => (
                <span key={index} className={index === 1 ? "font-semibold text-white" : ""}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </p>
            
            <p className="text-lg sm:text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              type="button"
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 h-14 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              onClick={handleStartAnalysis}
            >
              <span className="mr-2">
                {isLoggedIn ? t('home.hero.cta_matching') : t('home.hero.cta_primary')}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              type="button"
              size="lg"
              variant="outline"
              className="border-2 border-blue-400/50 text-blue-100 hover:bg-blue-500/10 bg-transparent/10 backdrop-blur-sm font-semibold text-lg px-8 py-4 h-14 rounded-xl hover:border-blue-300 transition-all duration-300"
              onClick={handleExploreServices}
            >
              {t('home.hero.cta_secondary')}
            </Button>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <Globe className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{t('home.hero.features.global_network.title')}</h3>
              <p className="text-sm text-blue-200/80">{t('home.hero.features.global_network.description')}</p>
            </div>
            <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{t('home.hero.features.ai_analysis.title')}</h3>
              <p className="text-sm text-blue-200/80">{t('home.hero.features.ai_analysis.description')}</p>
            </div>
            <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <Shield className="w-8 h-8 mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{t('home.hero.features.expert_verification.title')}</h3>
              <p className="text-sm text-blue-200/80">{t('home.hero.features.expert_verification.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-blue-400/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-blue-400/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}