import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const nav = [
  { to: "/admin/companies", labelKey: "Companies" },
  { to: "/admin/matching-requests", labelKey: "Matching Requests" },
  { to: "/admin/data-upload", labelKey: "Data Upload" },
  { to: "/admin/market-data", labelKey: "Market Data" },
  { to: "/admin/reports", labelKey: "Reports" },
  { to: "/admin/mail-logs", labelKey: "Mail Logs" },
  { to: "/admin/prompts", labelKey: "Prompts" },
  { to: "/admin/excel", labelKey: "Excel" },
  { to: "/admin/newsletter", labelKey: "Newsletter" },
];

export default function AdminLayout() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[220px_1fr]">
      <aside className="border-b md:border-b-0 md:border-r bg-muted/40">
        <div className="p-4 font-semibold text-lg">Admin</div>
        <nav className="flex md:flex-col gap-2 p-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-3 py-2 rounded-md text-sm",
                location.pathname.startsWith(item.to)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {t(item.labelKey) || item.labelKey}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
