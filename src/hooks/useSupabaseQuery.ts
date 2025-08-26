import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { performanceSupabase } from '@/lib/supabase-performance';
import { useApiPerformanceTracking } from './usePerformanceMonitoring';

// Generic hook for Supabase select queries
export function useSupabaseQuery<T>(
  queryKey: string[],
  table: string,
  query: string = '*',
  filters?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const performanceTracking = useApiPerformanceTracking();

  return useQuery<T>({
    queryKey: [...queryKey, filters],
    queryFn: async () => {
      const { data, error } = await performanceSupabase.select<T>(table, query, filters);
      if (error) throw error;
      return data;
    },
    ...performanceTracking,
    ...options,
  });
}

// Hook for Supabase insert mutations
export function useSupabaseInsert<T>(
  table: string,
  options?: UseMutationOptions<T, Error, unknown>
) {
  const queryClient = useQueryClient();
  const performanceTracking = useApiPerformanceTracking();

  return useMutation<T, Error, unknown>({
    mutationFn: async (data) => {
      const { data: result, error } = await performanceSupabase.insert<T>(table, data);
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [table] });
      performanceTracking.onSuccess?.(data, variables, context);
      options?.onSuccess?.(data, variables, context);
    },
    onError: performanceTracking.onError,
    onMutate: performanceTracking.onMutate,
    ...options,
  });
}

// Hook for Supabase update mutations
export function useSupabaseUpdate<T>(
  table: string,
  options?: UseMutationOptions<T, Error, { data: unknown; filters: Record<string, unknown> }>
) {
  const queryClient = useQueryClient();
  const performanceTracking = useApiPerformanceTracking();

  return useMutation<T, Error, { data: unknown; filters: Record<string, unknown> }>({
    mutationFn: async ({ data, filters }) => {
      const { data: result, error } = await performanceSupabase.update<T>(table, data, filters);
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [table] });
      performanceTracking.onSuccess?.(data, variables, context);
      options?.onSuccess?.(data, variables, context);
    },
    onError: performanceTracking.onError,
    onMutate: performanceTracking.onMutate,
    ...options,
  });
}

// Hook for Supabase delete mutations
export function useSupabaseDelete<T>(
  table: string,
  options?: UseMutationOptions<T, Error, Record<string, unknown>>
) {
  const queryClient = useQueryClient();
  const performanceTracking = useApiPerformanceTracking();

  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: async (filters) => {
      const { data, error } = await performanceSupabase.delete<T>(table, filters);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [table] });
      performanceTracking.onSuccess?.(data, variables, context);
      options?.onSuccess?.(data, variables, context);
    },
    onError: performanceTracking.onError,
    onMutate: performanceTracking.onMutate,
    ...options,
  });
}

// Hook for Supabase Edge Function calls
export function useSupabaseFunction<T, TVariables = unknown>(
  functionName: string,
  options?: UseMutationOptions<T, Error, TVariables>
) {
  const performanceTracking = useApiPerformanceTracking();

  return useMutation<T, Error, TVariables>({
    mutationFn: async (variables) => {
      const { data, error } = await performanceSupabase.invokeFunction<T>(functionName, variables);
      if (error) throw error;
      return data;
    },
    onSuccess: performanceTracking.onSuccess,
    onError: performanceTracking.onError,
    onMutate: (variables) => ({
      ...performanceTracking.onMutate?.(variables),
      endpoint: `function_${functionName}`,
    }),
    ...options,
  });
}

// Hook for file uploads
export function useFileUpload(
  bucket: string,
  options?: UseMutationOptions<unknown, Error, { path: string; file: File }>
) {
  const performanceTracking = useApiPerformanceTracking();

  return useMutation<unknown, Error, { path: string; file: File }>({
    mutationFn: async ({ path, file }) => {
      const { data, error } = await performanceSupabase.uploadFile(bucket, path, file);
      if (error) throw error;
      return data;
    },
    onSuccess: performanceTracking.onSuccess,
    onError: performanceTracking.onError,
    onMutate: (variables) => ({
      ...performanceTracking.onMutate?.(variables),
      endpoint: `upload_${bucket}`,
    }),
    ...options,
  });
}
