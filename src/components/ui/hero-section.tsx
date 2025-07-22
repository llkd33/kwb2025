import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Globe, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-bg.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const company = localStorage.getItem('currentCompany');
      setIsLoggedIn(!!company);
      console.log('Login status:', !!company); // 디버깅용
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  }, []);

  const handleStartAnalysis = () => {
    console.log('Start analysis clicked, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      navigate('/matching-request');
    } else {
      navigate('/auth');
    }
  };

  const handleExploreServices = () => {
    console.log('Explore services clicked');
    navigate('/services');
  };

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
            <span className="text-sm font-medium">{t('home.hero.badge')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up [animation-delay:200ms]">
            {t('home.hero.title').split('\n').map((line, index) => (
              <span key={index}>
                {index === 1 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                    {line}
                  </span>
                ) : (
                  line
                )}
                {index === 0 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-4 text-white/90 animate-fade-up [animation-delay:400ms]">
            {t('home.hero.subtitle').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index === 0 && <br />}
              </span>
            ))}
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-white/80 animate-fade-up [animation-delay:600ms]">
            {t('home.hero.goldman')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up [animation-delay:800ms]">
            <button 
              className="bg-white text-gray-800 hover:bg-gray-100 font-medium text-lg px-8 py-4 h-14 rounded-lg flex items-center justify-center gap-2 transition-colors"
              onClick={handleStartAnalysis}
              type="button"
            >
              {isLoggedIn ? t('home.hero.matching_request') : t('home.hero.cta')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              className="border-2 border-white/30 text-white hover:bg-white/10 font-medium text-lg px-8 py-4 h-14 rounded-lg flex items-center justify-center transition-colors"
              onClick={handleExploreServices}
              type="button"
            >
              {t('home.hero.explore')}
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up [animation-delay:1000ms]">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Globe className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">{t('home.hero.global_network')}</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <BarChart3 className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">{t('home.hero.ai_analysis')}</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm">{t('home.hero.custom_matching')}</span>
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