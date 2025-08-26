import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  averagePageLoad: number;
  apiResponseTimes: Record<string, number>;
  errorRates: Record<string, number>;
  userEngagement: EngagementMetrics;
}

export interface EngagementMetrics {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

export interface ApiCallMetrics {
  endpoint: string;
  duration: number;
  status: number;
  timestamp: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private apiCalls: ApiCallMetrics[] = [];
  private pageLoads: Map<string, number[]> = new Map();
  private userActions: Map<string, number[]> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  private constructor() {
    this.initWebVitals();
  }

  private initWebVitals() {
    // Track Core Web Vitals
    onCLS(this.onVitalMetric.bind(this));
    onINP(this.onVitalMetric.bind(this));
    onFCP(this.onVitalMetric.bind(this));
    onLCP(this.onVitalMetric.bind(this));
    onTTFB(this.onVitalMetric.bind(this));
  }

  private onVitalMetric(metric: Metric) {
    const values = this.metrics.get(metric.name) || [];
    values.push(metric.value);
    this.metrics.set(metric.name, values);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }
    
    // In production, you might want to send this to an analytics service
    this.sendToAnalytics(metric);
  }

  trackPageLoad(route: string, loadTime: number): void {
    const loads = this.pageLoads.get(route) || [];
    loads.push(loadTime);
    this.pageLoads.set(route, loads);
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] Page load ${route}:`, loadTime, 'ms');
    }
  }

  trackApiCall(endpoint: string, duration: number, status: number): void {
    const apiCall: ApiCallMetrics = {
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
    };
    
    this.apiCalls.push(apiCall);
    
    // Keep only last 100 API calls to prevent memory leaks
    if (this.apiCalls.length > 100) {
      this.apiCalls.shift();
    }
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] API call ${endpoint}:`, duration, 'ms', `(${status})`);
    }
  }

  trackUserAction(action: string, duration: number): void {
    const actions = this.userActions.get(action) || [];
    actions.push(duration);
    this.userActions.set(action, actions);
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] User action ${action}:`, duration, 'ms');
    }
  }

  getMetrics(): PerformanceMetrics {
    const apiResponseTimes: Record<string, number> = {};
    const errorRates: Record<string, number> = {};
    
    // Calculate average API response times
    const apiByEndpoint = this.groupApiCallsByEndpoint();
    for (const [endpoint, calls] of apiByEndpoint.entries()) {
      const totalTime = calls.reduce((sum, call) => sum + call.duration, 0);
      apiResponseTimes[endpoint] = totalTime / calls.length;
      
      const errorCount = calls.filter(call => call.status >= 400).length;
      errorRates[endpoint] = (errorCount / calls.length) * 100;
    }
    
    // Calculate average page load time
    const allPageLoads = Array.from(this.pageLoads.values()).flat();
    const averagePageLoad = allPageLoads.length > 0 
      ? allPageLoads.reduce((sum, time) => sum + time, 0) / allPageLoads.length 
      : 0;
    
    return {
      averagePageLoad,
      apiResponseTimes,
      errorRates,
      userEngagement: this.calculateEngagementMetrics(),
    };
  }

  private groupApiCallsByEndpoint(): Map<string, ApiCallMetrics[]> {
    const grouped = new Map<string, ApiCallMetrics[]>();
    
    for (const call of this.apiCalls) {
      const existing = grouped.get(call.endpoint) || [];
      existing.push(call);
      grouped.set(call.endpoint, existing);
    }
    
    return grouped;
  }

  private calculateEngagementMetrics(): EngagementMetrics {
    // Basic engagement metrics - can be enhanced based on requirements
    return {
      sessionDuration: this.getSessionDuration(),
      pageViews: this.pageLoads.size,
      bounceRate: this.calculateBounceRate(),
    };
  }

  private getSessionDuration(): number {
    // Simple session duration calculation
    const firstCall = this.apiCalls[0];
    const lastCall = this.apiCalls[this.apiCalls.length - 1];
    
    if (!firstCall || !lastCall) return 0;
    
    return lastCall.timestamp - firstCall.timestamp;
  }

  private calculateBounceRate(): number {
    // Simple bounce rate calculation - single page view sessions
    const singlePageSessions = Array.from(this.pageLoads.values())
      .filter(loads => loads.length === 1).length;
    
    const totalSessions = this.pageLoads.size;
    return totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;
  }

  private sendToAnalytics(metric: Metric): void {
    // In a real application, you would send this to your analytics service
    // For now, we'll just store it locally
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('performance-metrics') || '[]';
        const metrics = JSON.parse(stored);
        metrics.push({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
        });
        
        // Keep only last 50 metrics
        if (metrics.length > 50) {
          metrics.splice(0, metrics.length - 50);
        }
        
        localStorage.setItem('performance-metrics', JSON.stringify(metrics));
      } catch (error) {
        console.warn('Failed to store performance metrics:', error);
      }
    }
  }

  // Method to clear old data
  clearOldData(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.apiCalls = this.apiCalls.filter(call => call.timestamp > oneHourAgo);
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance();

// Utility function to measure async operations
export async function measureAsync<T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    performanceTracker.trackUserAction(label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceTracker.trackUserAction(`${label}_error`, duration);
    throw error;
  }
}

// Utility function to measure synchronous operations
export function measureSync<T>(
  operation: () => T,
  label: string
): T {
  const start = performance.now();
  try {
    const result = operation();
    const duration = performance.now() - start;
    performanceTracker.trackUserAction(label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceTracker.trackUserAction(`${label}_error`, duration);
    throw error;
  }
}