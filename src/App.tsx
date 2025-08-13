import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import LoadingScreen from "@/components/ui/loading-screen";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminReportEditor from "./pages/AdminReportEditor";
import AdminExcelManager from "./pages/AdminExcelManager";
import AdminPromptManager from "./pages/AdminPromptManager";
import AdminNewsletter from "./pages/AdminNewsletter";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import MatchingRequest from "./pages/MatchingRequest";
import PDFReportSubmission from "./pages/PDFReportSubmission";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading } = useLanguage();

  if (isLoading) {
    return <LoadingScreen variant="splash" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/report/:id" element={<AdminReportEditor />} />
        <Route path="/admin/excel" element={<AdminExcelManager />} />
        <Route path="/admin/prompts" element={<AdminPromptManager />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        {/** 문서 관리 페이지는 비활성화됨 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/matching-request" element={<MatchingRequest />} />
        <Route path="/pdf-report" element={<PDFReportSubmission />} />
        <Route path="/report/:token" element={<Report />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner 
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
          />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
