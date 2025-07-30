'use client';

import { DashboardMetrics, OrderFilters, ProductAnalytics, OrderAnalytics, ActivityItem, GlobalSearchResult, BulkUpdateResult } from '@/lib/dynamic-types';
import { httpClient, ApiResponse } from './httpClient';
import { tryCatch } from './errorHandler';

// Constants
const API_ENDPOINTS = {
  METRICS: '/api/dashboard/metrics',
  REAL_METRICS: '/api/dashboard/real-metrics',
  ORDER_ANALYTICS: '/api/dashboard/orders/analytics',
  REAL_ORDER_ANALYTICS: '/api/dashboard/real-orders/analytics',
  PRODUCT_ANALYTICS: '/api/dashboard/products/analytics',
  EXPORT_ORDERS: '/api/dashboard/orders/export',
  BULK_UPDATE: '/api/dashboard/orders/bulk-update',
  GLOBAL_SEARCH: '/api/dashboard/search',
  REAL_SEARCH: '/api/dashboard/real-search',
  ACTIVITY_FEED: '/api/dashboard/activity',
} as const;

/**
 * Dashboard service for handling all dashboard-related API calls
 */
class DashboardService {
  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return tryCatch<ApiResponse<DashboardMetrics>, ApiResponse<DashboardMetrics>>(
      async () => {
        const response = await httpClient.get<DashboardMetrics>(API_ENDPOINTS.METRICS);
        return response;
      },
      (error) => {
        console.error('Get metrics failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil data metrics',
        } as ApiResponse<DashboardMetrics>;
      },
    );
  }

  /**
   * Get order analytics with filters
   */
  async getOrderAnalytics(filters?: OrderFilters): Promise<ApiResponse<OrderAnalytics>> {
    return tryCatch<ApiResponse<OrderAnalytics>, ApiResponse<OrderAnalytics>>(
      async () => {
        const queryParams = new URLSearchParams();
        
        if (filters) {
          if (filters.status?.length) {
            queryParams.append('status', filters.status.join(','));
          }
          if (filters.dateRange) {
            queryParams.append('startDate', filters.dateRange.start.toISOString());
            queryParams.append('endDate', filters.dateRange.end.toISOString());
          }
          if (filters.customer) {
            queryParams.append('customer', filters.customer);
          }
          if (filters.minAmount) {
            queryParams.append('minAmount', filters.minAmount.toString());
          }
          if (filters.maxAmount) {
            queryParams.append('maxAmount', filters.maxAmount.toString());
          }
          if (filters.category?.length) {
            queryParams.append('category', filters.category.join(','));
          }
          if (filters.search) {
            queryParams.append('search', filters.search);
          }
        }

        const url = `${API_ENDPOINTS.ORDER_ANALYTICS}?${queryParams.toString()}`;
        const response = await httpClient.get<OrderAnalytics>(url);
        return response;
      },
      (error) => {
        console.error('Get order analytics failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil data analytics pesanan',
        };
      },
    );
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(productId?: string): Promise<ApiResponse<ProductAnalytics | ProductAnalytics[]>> {
    return tryCatch<ApiResponse<ProductAnalytics | ProductAnalytics[]>, ApiResponse<ProductAnalytics | ProductAnalytics[]>>(
      async () => {
        const url = productId 
          ? `${API_ENDPOINTS.PRODUCT_ANALYTICS}/${productId}`
          : API_ENDPOINTS.PRODUCT_ANALYTICS;
        
        const response = await httpClient.get<ProductAnalytics | ProductAnalytics[]>(url);
        return response;
      },
      (error) => {
        console.error('Get product analytics failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil data analytics produk',
        } as ApiResponse<ProductAnalytics | ProductAnalytics[]>;
      },
    );
  }

  /**
   * Export orders to Excel/CSV
   */
  async exportOrders(filters?: OrderFilters, format: 'excel' | 'csv' = 'excel'): Promise<Blob | null> {
    return tryCatch<Blob | null, null>(
      async () => {
        const queryParams = new URLSearchParams();
        queryParams.append('format', format);
        
        if (filters) {
          if (filters.status?.length) {
            queryParams.append('status', filters.status.join(','));
          }
          if (filters.dateRange) {
            queryParams.append('startDate', filters.dateRange.start.toISOString());
            queryParams.append('endDate', filters.dateRange.end.toISOString());
          }
          if (filters.customer) {
            queryParams.append('customer', filters.customer);
          }
          if (filters.search) {
            queryParams.append('search', filters.search);
          }
        }

        const url = `${API_ENDPOINTS.EXPORT_ORDERS}?${queryParams.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        return await response.blob();
      },
      (error) => {
        console.error('Export orders failed:', error);
        return null;
      },
    );
  }

  /**
   * Bulk update order status
   */
  async bulkUpdateOrderStatus(orderIds: string[], status: string): Promise<ApiResponse<BulkUpdateResult>> {
    return tryCatch<ApiResponse<BulkUpdateResult>, ApiResponse<BulkUpdateResult>>(
      async () => {
        const response = await httpClient.post<BulkUpdateResult>(API_ENDPOINTS.BULK_UPDATE, {
          orderIds,
          status,
        });
        return response;
      },
      (error) => {
        console.error('Bulk update failed:', error);
        return {
          success: false,
          error: 'Gagal melakukan update massal',
        };
      },
    );
  }

  /**
   * Get real-time metrics (for WebSocket fallback)
   */
  async getRealtimeMetrics(): Promise<DashboardMetrics | null> {
    const response = await this.getMetrics();
    return response.success ? response.data || null : null;
  }

  /**
   * Search across all entities
   */
  async globalSearch(query: string, entities: string[] = ['orders', 'products', 'customers']): Promise<ApiResponse<GlobalSearchResult>> {
    return tryCatch<ApiResponse<GlobalSearchResult>, ApiResponse<GlobalSearchResult>>(
      async () => {
        const queryParams = new URLSearchParams();
        queryParams.append('q', query);
        queryParams.append('entities', entities.join(','));

        const url = `${API_ENDPOINTS.GLOBAL_SEARCH}?${queryParams.toString()}`;
        const response = await httpClient.get<GlobalSearchResult>(url);
        return response;
      },
      (error) => {
        console.error('Global search failed:', error);
        return {
          success: false,
          error: 'Gagal melakukan pencarian',
        };
      },
    );
  }

  /**
   * Get real dashboard metrics from database
   */
  async getRealMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return tryCatch<ApiResponse<DashboardMetrics>, ApiResponse<DashboardMetrics>>(
      async () => {
        const response = await httpClient.get<DashboardMetrics>(API_ENDPOINTS.REAL_METRICS);
        return response;
      },
      (error) => {
        console.error('Get real metrics failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil data real metrics',
        } as ApiResponse<DashboardMetrics>;
      },
    );
  }

  /**
   * Get real order analytics from database
   */
  async getRealOrderAnalytics(): Promise<ApiResponse<OrderAnalytics>> {
    return tryCatch<ApiResponse<OrderAnalytics>, ApiResponse<OrderAnalytics>>(
      async () => {
        const response = await httpClient.get<OrderAnalytics>(API_ENDPOINTS.REAL_ORDER_ANALYTICS);
        return response;
      },
      (error) => {
        console.error('Get real order analytics failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil data real analytics pesanan',
        };
      },
    );
  }

  /**
   * Real search across all entities from database
   */
  async realSearch(query: string): Promise<ApiResponse<GlobalSearchResult>> {
    return tryCatch<ApiResponse<GlobalSearchResult>, ApiResponse<GlobalSearchResult>>(
      async () => {
        const queryParams = new URLSearchParams();
        queryParams.append('q', query);

        const url = `${API_ENDPOINTS.REAL_SEARCH}?${queryParams.toString()}`;
        const response = await httpClient.get<GlobalSearchResult>(url);
        return response;
      },
      (error) => {
        console.error('Real search failed:', error);
        return {
          success: false,
          error: 'Gagal melakukan pencarian real',
        };
      },
    );
  }

  /**
   * Get dashboard activity feed
   */
  async getActivityFeed(limit: number = 20): Promise<ApiResponse<ActivityItem[]>> {
    return tryCatch<ApiResponse<ActivityItem[]>, ApiResponse<ActivityItem[]>>(
      async () => {
        const url = `${API_ENDPOINTS.ACTIVITY_FEED}?limit=${limit}`;
        const response = await httpClient.get<ActivityItem[]>(url);
        return response;
      },
      (error) => {
        console.error('Get activity feed failed:', error);
        return {
          success: false,
          error: 'Gagal mengambil activity feed',
          data: [],
        };
      },
    );
  }
}

// Create singleton instance
export const dashboardService = new DashboardService();