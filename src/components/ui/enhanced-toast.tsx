import { toast as sonnerToast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useEnhancedToast = () => {
  const { t } = useLanguage();

  const success = (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle className="w-5 h-5" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <XCircle className="w-5 h-5" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <AlertCircle className="w-5 h-5" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="w-5 h-5" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const loading = (message: string, options?: Omit<ToastOptions, 'action'>) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: options?.duration || Infinity,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });
  };

  const promise = <T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    });
  };

  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  // Predefined common toasts with translations
  const common = {
    loginSuccess: () => success(t('notifications.success.login')),
    loginError: () => error(t('notifications.error.login')),
    logoutSuccess: () => success(t('notifications.success.logout')),
    saveSuccess: () => success(t('notifications.success.save')),
    saveError: () => error(t('notifications.error.save')),
    uploadSuccess: () => success(t('notifications.success.upload')),
    uploadError: () => error(t('notifications.error.upload')),
    deleteSuccess: () => success(t('notifications.success.delete')),
    deleteError: () => error(t('notifications.error.delete')),
    networkError: () => error(t('notifications.error.network')),
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    common,
  };
};

export default useEnhancedToast;
