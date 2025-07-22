'use client';

import axios from 'axios';

// Base URL untuk backend Go
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// Create axios instance dengan konfigurasi default
const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface untuk response API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface untuk Order dari backend
export interface BackendOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Service functions
export const backendService = {
  // Test koneksi ke backend
  async ping(): Promise<ApiResponse> {
    try {
      const response = await backendApi.get('/api/ping');
      return {
        success: true,
        data: response.data,
        message: 'Backend connected successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect to backend',
        message: 'Backend connection failed'
      };
    }
  },

  // Get all orders
  async getOrders(): Promise<ApiResponse<BackendOrder[]>> {
    try {
      const response = await backendApi.get('/api/orders');
      return {
        success: true,
        data: response.data,
        message: 'Orders fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch orders',
        message: 'Failed to get orders'
      };
    }
  },

  // Get order by ID
  async getOrderById(id: string): Promise<ApiResponse<BackendOrder>> {
    try {
      const response = await backendApi.get(`/api/orders/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Order fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch order',
        message: 'Failed to get order'
      };
    }
  },

  // Create new order
  async createOrder(orderData: Partial<BackendOrder>): Promise<ApiResponse<BackendOrder>> {
    try {
      const response = await backendApi.post('/api/orders', orderData);
      return {
        success: true,
        data: response.data,
        message: 'Order created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create order',
        message: 'Failed to create order'
      };
    }
  },

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<BackendOrder>> {
    try {
      const response = await backendApi.put(`/api/orders/${id}/status`, { status });
      return {
        success: true,
        data: response.data,
        message: 'Order status updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update order status',
        message: 'Failed to update order status'
      };
    }
  }
};

export default backendService;