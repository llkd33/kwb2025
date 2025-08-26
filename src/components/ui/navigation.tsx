import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { session, user, signOut } = useAuth();
  const [currentCompany, setCurrentCompany] = useState<{ company_name?: string; is_admin?: boolean } | null>(null);
  const isLoggedIn = !!session && !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load company profile when authenticated or route changes
  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.email) {
        setCurrentCompany(null);
        return;
      }
      const { data } = await supabase
        .from('companies')
        .select('company_name, is_admin, email')
        .eq('email', user.email)
        .single();
      setCurrentCompany(data || null);
    };
    loadCompany();
  }, [user?.email, location.pathname]);

  // 기본 네비게이션 아이템
  const baseNavItems = [
    { href: "/", label: t('navigation.home') },
    { href: "/about", label: t('navigation.about') },
    { href: "/services", label: t('navigation.services') },
  ];

  // 로그인된 사용자용 아이템
  const userNavItems = [
    // 문서 관리 메뉴 비활성화
    { href: "/dashboard", label: t('navigation.dashboard') },
  ];

  // 관리자용 아이템
  const adminNavItems = [
    { href: "/admin", label: t('navigation.admin') },
  ];

  // 최종 네비게이션 아이템 구성
  let navItems = [...baseNavItems];
  
  if (isLoggedIn) {
    navItems = [...navItems, ...userNavItems];
    
    // 관리자인 경우 관리자 메뉴 추가
    if (currentCompany?.is_admin) {
      navItems = [...navItems, ...adminNavItems];
    }
  }

  if (isMobile) {
    return (
      <nav className={cn("flex items-center justify-between w-full", className)}>
        <div className="flex items-center space-x-2">
          <LanguageSelector />
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-lg font-semibold text-white">{t('navigation.menu')}</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block text-lg font-medium transition-colors py-2",
                          location.pathname === item.href
                            ? "text-accent"
                            : "text-gray-300 hover:text-white"
                        )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="pt-6 border-t border-gray-700">
                    {isLoggedIn ? (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-400">
                          {currentCompany?.company_name}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-600 text-white hover:bg-gray-800"
                          onClick={async () => {
                            await signOut();
                            window.location.href = '/';
                          }}
                        >
                          {t('navigation.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="ghost" className="w-full text-white hover:bg-gray-800" asChild>
                          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                            {t('navigation.login')}
                          </Link>
                        </Button>
                        <Button className="w-full bg-gradient-primary hover:opacity-90" asChild>
                          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                            {t('navigation.signup')}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center space-x-8", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-accent",
            location.pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
      <div className="flex items-center space-x-4 ml-8">
        <LanguageSelector />
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {currentCompany?.company_name}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }}
            >
              {t('navigation.logout')}
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">{t('navigation.login')}</Link>
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90" asChild>
              <Link to="/auth">{t('navigation.signup')}</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
