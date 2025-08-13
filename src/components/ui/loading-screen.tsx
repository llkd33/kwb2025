import { Loader2, Globe, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingScreenProps {
  message?: string;
  variant?: "default" | "minimal" | "splash";
}

export const LoadingScreen = ({ message, variant = "default" }: LoadingScreenProps) => {
  const { t } = useLanguage();

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {message || t('common.loading')}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "splash") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">KB</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            KnowWhere Bridge
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <span className="text-lg text-blue-200">
              {message || t('common.loading')}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-blue-300/80">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl animate-pulse"></div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {message || t('common.loading')}
        </h3>
        
        <p className="text-muted-foreground">
          {t('common.please_wait', 'Please wait a moment...')}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;