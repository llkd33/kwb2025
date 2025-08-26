import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import LoadingScreen from "@/components/ui/loading-screen";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminReportEditor from "./pages/AdminReportEditor";
import AdminExcelManager from "./pages/AdminExcelManager";
import AdminPromptManager from "./pages/AdminPromptManager";
import AdminNewsletter from "./pages/AdminNewsletter";
import DashboardPage from "./pages/DashboardPage";
import Services from "./pages/Services";
import MatchingRequest from "./pages/MatchingRequest";
import PDFReportSubmission from "./pages/PDFReportSubmission";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BusinessDocuments from "./pages/BusinessDocuments";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminCompanies from "./pages/admin/Companies";
import AdminMatchingRequests from "./pages/admin/MatchingRequests";
import AdminMarketData from "./pages/admin/MarketData";
import AdminReports from "./pages/admin/Reports";
import AdminMailLogs from "./pages/admin/MailLogs";
import AdminDataUpload from "./pages/admin/DataUpload";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        const status = (error as { status?: number } | undefined)?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for important data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const RouterContent = () => {
  // Initialize performance monitoring - now inside Router context
  usePerformanceMonitoring();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminCompanies />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="matching-requests" element={<AdminMatchingRequests />} />
        <Route path="data-upload" element={<AdminDataUpload />} />
        <Route path="market-data" element={<AdminMarketData />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="mail-logs" element={<AdminMailLogs />} />
        <Route path="report/:id" element={<AdminReportEditor />} />
        <Route path="excel" element={<AdminExcelManager />} />
        <Route path="prompts" element={<AdminPromptManager />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
      </Route>
      {/** 문서 관리 페이지는 비활성화됨 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-documents"
        element={
          <ProtectedRoute>
            <BusinessDocuments />
          </ProtectedRoute>
        }
      />
      <Route path="/services" element={<Services />} />
      <Route path="/matching-request" element={<MatchingRequest />} />
      <Route path="/pdf-report" element={<PDFReportSubmission />} />
      <Route path="/report/:token" element={<Report />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  const { isLoading } = useLanguage();

  if (isLoading) {
    return <LoadingScreen variant="splash" />;
  }

  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
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
        </AuthProvider>
      </LanguageProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
