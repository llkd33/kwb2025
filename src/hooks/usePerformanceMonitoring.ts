import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { performanceTracker } from '@/lib/performance';

export function usePerformanceMonitoring() {
  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();
    
    // Track page load time
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      performanceTracker.trackPageLoad(location.pathname, loadTime);
    };

    // If page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [location.pathname]);

  // Clean up old performance data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      performanceTracker.clearOldData();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);
}

// Hook for tracking API calls with React Query
export function useApiPerformanceTracking() {
  return {
    onSuccess: (data: unknown, variables: unknown, context?: { startTime?: number; endpoint?: string }) => {
      // Track successful API calls
      if (context?.startTime) {
        const duration = performance.now() - context.startTime;
        performanceTracker.trackApiCall(context.endpoint || 'unknown', duration, 200);
      }
    },
    onError: (error: unknown, variables: unknown, context?: { startTime?: number; endpoint?: string }) => {
      // Track failed API calls
      if (context?.startTime) {
        const duration = performance.now() - context.startTime;
        const status = (error as { status?: number } | undefined)?.status ?? 500;
        performanceTracker.trackApiCall(context.endpoint || 'unknown', duration, status);
      }
    },
    onMutate: (variables: unknown) => {
      // Return context with start time
      return {
        startTime: performance.now(),
        endpoint: (variables as { endpoint?: string } | undefined)?.endpoint || 'mutation',
      };
    },
  };
}
