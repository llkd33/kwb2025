import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const company = localStorage.getItem('currentCompany');
    if (company) {
      const parsedCompany = JSON.parse(company);
      setCurrentCompany(parsedCompany);
      setIsLoggedIn(true);
    } else {
      setCurrentCompany(null);
      setIsLoggedIn(false);
    }
  }, [location.pathname]); // location이 변경될 때마다 체크

  // 기본 네비게이션 아이템
  const baseNavItems = [
    { href: "/", label: t('nav.home') },
    { href: "/about", label: t('nav.about') },
  ];

  // 로그인된 사용자용 아이템
  const userNavItems = [
    { href: "/business-documents", label: "서류관리" },
    { href: "/dashboard", label: t('nav.dashboard') },
  ];

  // 관리자용 아이템
  const adminNavItems = [
    { href: "/admin", label: "관리자" },
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

  return (
    <nav className={cn("flex items-center space-x-8", className)}>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-accent",
            location.pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </a>
      ))}
      <div className="flex items-center space-x-4 ml-8">
        <LanguageSelector />
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {currentCompany?.company_name}님
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                localStorage.removeItem('currentCompany');
                window.location.href = '/';
              }}
            >
              {t('nav.logout')}
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <a href="/auth">{t('nav.login')}</a>
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90" asChild>
              <a href="/auth">{t('auth.signup')}</a>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}