import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { href: "/", label: t('navigation.home'), icon: Home },
    { href: "/services", label: t('navigation.services'), icon: Search },
    { href: "/about", label: t('navigation.about'), icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <span className="text-5xl font-bold text-white">404</span>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <CardTitle className="text-3xl mb-2">{t('errors.404.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('errors.404.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="min-w-[140px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
              <Button asChild size="lg" className="min-w-[140px]">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  {t('errors.404.back_home')}
                </Link>
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                Popular Pages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {popularPages.map((page) => (
                  <Button
                    key={page.href}
                    asChild
                    variant="ghost"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent/50"
                  >
                    <Link to={page.href}>
                      <page.icon className="w-6 h-6" />
                      <span className="text-sm">{page.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
