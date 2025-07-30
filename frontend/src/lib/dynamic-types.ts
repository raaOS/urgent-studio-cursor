import { z } from 'zod';
import { ProductSchema, OrderSchema, Order } from './types';

// Dashboard Metrics Types
export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  pendingOrders: number;
  completedToday: number;
  revenueToday: number;
  ordersByStatus: Record<string, number>;
  revenueByCategory: Record<string, number>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order_created' | 'order_updated' | 'product_updated';
    message: string;
    timestamp: string;
  }>;
}

// Order Filters for Advanced Search
export interface OrderFilters {
  status?: string[];
  dateRange?: { start: Date; end: Date };
  customer?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string[];
  search?: string;
}

// Product Analytics
export interface ProductAnalytics {
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  popularityScore: number;
  categoryRanking: number;
  lastUpdated: string;
}

// Enhanced Product Type
export const EnhancedProductSchema = ProductSchema.extend({
  category: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  deliveryTime: z.string(),
  revisions: z.number(),
  popular: z.boolean(),
  analytics: z.object({
    views: z.number(),
    orders: z.number(),
    revenue: z.number(),
    conversionRate: z.number(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EnhancedProduct = z.infer<typeof EnhancedProductSchema>;

// Notification System
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  userId?: string;
}

// WebSocket Events
export interface WebSocketEvents {
  'order:created': Order;
  'order:updated': { orderId: string; status: string; updatedBy: string };
  'product:updated': EnhancedProduct;
  'admin:notification': Notification;
  'metrics:updated': DashboardMetrics;
  'user:connected': { userId: string; role: string };
  'user:disconnected': { userId: string };
}

// Chart Configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data: Record<string, unknown>[];
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  timeRange?: { start: Date; end: Date };
  colors?: string[];
  title?: string;
  subtitle?: string;
}

// Search Configuration
export interface SearchConfig {
  entities: ('orders' | 'products' | 'customers')[];
  filters: Record<string, unknown>;
  sorting: { field: string; direction: 'asc' | 'desc' };
  pagination: { page: number; limit: number };
  query?: string;
}

// User Role and Permissions
export const UserRoleSchema = z.enum(['admin', 'manager', 'staff', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageOrders: boolean;
  canManageProducts: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
}

// Enhanced Order Type with more details
export const EnhancedOrderSchema = OrderSchema.extend({
  customerEmail: z.string().email().optional(),
  customerAddress: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  estimatedCompletion: z.string().optional(),
  actualCompletion: z.string().optional(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).optional(),
});

export type EnhancedOrder = z.infer<typeof EnhancedOrderSchema>;

// File Upload Types
export interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  orderId?: string;
  productId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cache Configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[];
}

// Real-time Update Types
export interface RealTimeUpdate {
  type: 'create' | 'update' | 'delete';
  entity: 'order' | 'product' | 'user' | 'notification';
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

// Order Analytics Types
export interface OrderAnalytics {
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  orderTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  statusDistribution: Record<string, number>;
  revenueGrowth: number;
  customerRetention: number;
}

// Activity Feed Types
export interface ActivityItem {
  id: string;
  type: 'order_created' | 'order_updated' | 'product_updated' | 'user_action' | 'system_event';
  message: string;
  timestamp: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

// Global Search Result Types
export interface GlobalSearchResult {
  orders: Array<{
    id: string;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    status: string;
  }>;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    lastOrderDate: string;
  }>;
  totalResults: number;
}

// Bulk Update Result Types
export interface BulkUpdateResult {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
  message: string;
}