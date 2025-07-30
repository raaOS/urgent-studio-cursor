'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardMetrics, OrderAnalytics, GlobalSearchResult } from '@/lib/dynamic-types';

/**
 * Hook untuk real dashboard metrics dari database
 */
export function useRealDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getRealMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        setError(response.error || 'Gagal mengambil real metrics');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil real metrics');
      console.error('Real metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const refetch = useCallback((): void => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook untuk real order analytics dari database
 */
export function useRealOrderAnalytics() {
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getRealOrderAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Gagal mengambil real order analytics');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil real order analytics');
      console.error('Real order analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refetch = useCallback((): void => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook untuk real search dari database
 */
export function useRealSearch() {
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.realSearch(query);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Gagal melakukan real search');
        setResults(null);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan real search');
      setResults(null);
      console.error('Real search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback((): void => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}