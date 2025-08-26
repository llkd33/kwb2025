import { supabase } from '@/integrations/supabase/client';
import { performanceTracker } from './performance';

// Enhanced Supabase client with performance tracking
export class PerformanceSupabaseClient {
  private static instance: PerformanceSupabaseClient;

  static getInstance(): PerformanceSupabaseClient {
    if (!PerformanceSupabaseClient.instance) {
      PerformanceSupabaseClient.instance = new PerformanceSupabaseClient();
    }
    return PerformanceSupabaseClient.instance;
  }

  // Wrap Supabase queries with performance tracking
  async query<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    operationName: string
  ): Promise<{ data: T | null; error: unknown }> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      // Track successful queries
      performanceTracker.trackApiCall(
        `supabase_${operationName}`,
        duration,
        result.error ? 400 : 200
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track failed queries
      performanceTracker.trackApiCall(
        `supabase_${operationName}`,
        duration,
        500
      );
      
      throw error;
    }
  }

  // Convenience methods for common operations
  async select<T>(
    table: string,
    query: string = '*',
    filters?: Record<string, unknown>
  ): Promise<{ data: T | null; error: unknown }> {
    return this.query(async () => {
      let queryBuilder = supabase.from(table).select(query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      return await queryBuilder as unknown as { data: T | null; error: unknown };
    }, `select_${table}`);
  }

  async insert<T>(
    table: string,
    data: unknown
  ): Promise<{ data: T | null; error: unknown }> {
    return this.query(async () => {
      return await supabase.from(table).insert(data as never).select() as unknown as { data: T | null; error: unknown };
    }, `insert_${table}`);
  }

  async update<T>(
    table: string,
    data: unknown,
    filters: Record<string, unknown>
  ): Promise<{ data: T | null; error: unknown }> {
    return this.query(async () => {
      let queryBuilder = supabase.from(table).update(data as never);
      
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      return await queryBuilder.select() as unknown as { data: T | null; error: unknown };
    }, `update_${table}`);
  }

  async delete<T>(
    table: string,
    filters: Record<string, unknown>
  ): Promise<{ data: T | null; error: unknown }> {
    return this.query(async () => {
      let queryBuilder = supabase.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      return await queryBuilder.select() as unknown as { data: T | null; error: unknown };
    }, `delete_${table}`);
  }

  // Edge function calls with performance tracking
  async invokeFunction<T>(
    functionName: string,
    body?: unknown
  ): Promise<{ data: T | null; error: unknown }> {
    return this.query(async () => {
      const res = await supabase.functions.invoke(functionName, { body });
      return res as unknown as { data: T | null; error: unknown };
    }, `function_${functionName}`);
  }

  // Storage operations with performance tracking
  async uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<{ data: unknown; error: unknown }> {
    return this.query(async () => {
      return await supabase.storage.from(bucket).upload(path, file);
    }, `upload_${bucket}`);
  }

  async downloadFile(
    bucket: string,
    path: string
  ): Promise<{ data: unknown; error: unknown }> {
    return this.query(async () => {
      return await supabase.storage.from(bucket).download(path);
    }, `download_${bucket}`);
  }

  // Get the original supabase client for direct access when needed
  get client() {
    return supabase;
  }
}

// Export singleton instance
export const performanceSupabase = PerformanceSupabaseClient.getInstance();
