import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/ui/hero-section";
import { CompanyBrief } from "@/components/ui/company-brief";
import { FeaturesSection } from "@/components/ui/features-section";
import { Footer } from "@/components/ui/footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">NB</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">{t('service.name')}</span>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <CompanyBrief />
        <FeaturesSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
