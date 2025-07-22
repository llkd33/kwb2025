import { Navigation } from "@/components/ui/navigation";
import { CompanyIntro } from "@/components/ui/company-intro";
import { Footer } from "@/components/ui/footer";

const About = () => {
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
        <CompanyIntro />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;