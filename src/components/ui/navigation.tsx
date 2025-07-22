import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "홈" },
    { href: "/about", label: "회사소개" },
    { href: "/services", label: "서비스" },
    { href: "/dashboard", label: "대시보드" },
  ];

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
        <Button variant="ghost" size="sm">
          로그인
        </Button>
        <Button size="sm" className="bg-gradient-primary hover:opacity-90">
          회원가입
        </Button>
      </div>
    </nav>
  );
}