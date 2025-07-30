'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardMetrics, OrderFilters, ProductAnalytics, OrderAnalytics, GlobalSearchResult, ActivityItem } from '@/lib/dynamic-types';

/**
 * Hook untuk dashboard metrics
 */
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshMetrics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Gagal mengambil data metrics');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data metrics');
      console.error('Dashboard metrics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshMetrics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshMetrics, loading]);

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refreshMetrics,
  };
}

/**
 * Hook untuk order analytics dengan filtering
 */
export function useOrderAnalytics(filters?: OrderFilters) {
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getOrderAnalytics(filters);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Gagal mengambil data analytics pesanan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data analytics');
      console.error('Order analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

/**
 * Hook untuk product analytics
 */
export function useProductAnalytics(productId?: string) {
  const [analytics, setAnalytics] = useState<ProductAnalytics | ProductAnalytics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getProductAnalytics(productId);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Gagal mengambil data analytics produk');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data analytics');
      console.error('Product analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

/**
 * Hook untuk global search
 */
export function useGlobalSearch() {
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, entities?: string[]): Promise<void> => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.globalSearch(query, entities);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Gagal melakukan pencarian');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan pencarian');
      console.error('Global search error:', err);
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

/**
 * Hook untuk activity feed
 */
export function useActivityFeed(limit: number = 20) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getActivityFeed(limit);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        setActivities([]);
        setError(response.error || 'Gagal mengambil activity feed');
      }
    } catch (err) {
      setActivities([]);
      setError('Terjadi kesalahan saat mengambil activity feed');
      console.error('Activity feed error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchActivities();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchActivities, loading]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}

/**
 * Hook untuk bulk operations
 */
export function useBulkOperations() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdateOrderStatus = useCallback(async (orderIds: string[], status: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.bulkUpdateOrderStatus(orderIds, status);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Gagal melakukan update massal');
        return false;
      }
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan update massal');
      console.error('Bulk update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportOrders = useCallback(async (filters?: OrderFilters, format: 'excel' | 'csv' = 'excel'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await dashboardService.exportOrders(filters, format);
      
      if (blob) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
      } else {
        setError('Gagal mengekspor data pesanan');
        return false;
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengekspor data');
      console.error('Export error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    bulkUpdateOrderStatus,
    exportOrders,
  };
}