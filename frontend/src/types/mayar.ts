/**
 * TypeScript types for Mayar.id API Integration
 * 
 * This file contains all the type definitions for Mayar.id API
 * requests and responses to ensure type safety.
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface MayarApiResponse<T = unknown> {
  statusCode: number;
  messages: string;
  data?: T;
  hasMore?: boolean;
  pageCount?: number;
  pageSize?: number;
  page?: number;
}

export interface MayarError {
  statusCode: number;
  message: string;
  error?: string;
}

export type MayarEnvironment = 'production' | 'sandbox';

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export type ProductType = 
  | 'generic_link'
  | 'physical_product'
  | 'event'
  | 'webinar'
  | 'digital_product'
  | 'coaching'
  | 'cohort_based'
  | 'fundraising'
  | 'ebook'
  | 'podcast'
  | 'audiobook'
  | 'membership';

export type ProductStatus = 'active' | 'closed';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  status: ProductStatus;
  link?: string;
  category?: string | null;
  limit?: number;
  userId?: string;
  amount?: number | null;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ProductsByTypeParams {
  type: ProductType;
  page?: number;
  pageSize?: number;
}

// =============================================================================
// INVOICE TYPES
// =============================================================================

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface CreateInvoiceRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  dueDate?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// PAYMENT REQUEST TYPES
// =============================================================================

export interface CreatePaymentRequestRequest {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  expiryDate?: string;
  customFields?: Record<string, unknown>;
}

export interface PaymentRequest {
  id: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string;
  expiryDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// CUSTOMER TYPES
// =============================================================================

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  customFields?: Record<string, unknown>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';

export type PaymentMethod = 
  | 'bank_transfer'
  | 'credit_card'
  | 'e_wallet'
  | 'virtual_account'
  | 'qris'
  | 'paylater';

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  customerName: string;
  customerEmail: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  expiredAt?: string;
  customFields?: Record<string, unknown>;
}

export interface TransactionListParams {
  page?: number;
  pageSize?: number;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export type WebhookEventType = 
  | 'payment.paid'
  | 'payment.failed'
  | 'payment.expired'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'membership.memberExpired'
  | 'shipper.status';

export interface WebhookEvent {
  event: WebhookEventType;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

export interface RegisterWebhookRequest {
  url: string;
  events: WebhookEventType[];
  secret?: string;
}

export interface WebhookRegistration {
  id: string;
  url: string;
  events: WebhookEventType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookHistory {
  id: string;
  url: string;
  event: WebhookEventType;
  status: 'success' | 'failed' | 'pending';
  responseCode?: number;
  responseBody?: string;
  attempts: number;
  lastAttemptAt: string;
  createdAt: string;
}

// =============================================================================
// LICENSE TYPES
// =============================================================================

export type LicenseStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface VerifyLicenseRequest {
  licenseCode: string;
  productId: string;
}

export interface LicenseInfo {
  licenseCode: string;
  status: LicenseStatus;
  expiredAt?: string;
  transactionId: string;
  productId: string;
  customerId: string;
  customerName: string;
}

export interface VerifyLicenseResponse {
  statusCode: number;
  isLicenseActive: boolean;
  licenseCode: LicenseInfo;
}

export interface ActivateLicenseRequest {
  licenseCode: string;
  productId: string;
}

export interface DeactivateLicenseRequest {
  licenseCode: string;
  productId: string;
}

// =============================================================================
// INSTALLMENT TYPES
// =============================================================================

export interface InstallmentPlan {
  id: string;
  name: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  intervalDays: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstallmentRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  installmentCount: number;
  intervalDays: number;
  firstPaymentDate?: string;
  description?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// DISCOUNT & COUPON TYPES
// =============================================================================

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface ApplyCouponRequest {
  couponCode: string;
  amount: number;
}

export interface ApplyCouponResponse {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  coupon?: Coupon;
  message?: string;
}

// =============================================================================
// CART TYPES (UPCOMING)
// =============================================================================

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API CLIENT TYPES
// =============================================================================

export interface MayarApiClientConfig {
  apiKey: string;
  baseUrl: string;
  environment: MayarEnvironment;
  timeout?: number;
  retryAttempts?: number;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: Record<string, unknown>;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type MayarApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type MayarApiParams = PaginationParams & DateRangeParams & SortParams;