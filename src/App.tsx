import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminReportEditor from "./pages/AdminReportEditor";
import AdminExcelManager from "./pages/AdminExcelManager";
import AdminPromptManager from "./pages/AdminPromptManager";
import AdminNewsletter from "./pages/AdminNewsletter";
import BusinessDocuments from "./pages/BusinessDocuments";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import MatchingRequest from "./pages/MatchingRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="/business-documents" element={<BusinessDocuments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/matching-request" element={<MatchingRequest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
