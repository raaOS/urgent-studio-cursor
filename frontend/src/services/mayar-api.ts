/**
 * Mayar.id API Client Service
 * 
 * This service provides a type-safe client for interacting with Mayar.id API
 * from Next.js frontend applications.
 */

import { mayarConfig, getMayarHeaders, MAYAR_RATE_LIMIT } from '@/lib/mayar-config';
import type {
  MayarApiResponse,
  Product,
  ProductListParams,
  ProductsByTypeParams,
  Invoice,
  CreateInvoiceRequest,
  PaymentRequest,
  CreatePaymentRequestRequest,
  Customer,
  CreateCustomerRequest,
  Transaction,
  TransactionListParams,
  WebhookRegistration,
  RegisterWebhookRequest,
  WebhookHistory,
  VerifyLicenseRequest,
  VerifyLicenseResponse,
  ActivateLicenseRequest,
  DeactivateLicenseRequest,
  Coupon,
  CreateCouponRequest,
  ApplyCouponRequest,
  ApplyCouponResponse,
} from '@/types/mayar';

/**
 * Rate limiter to respect Mayar API limits
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = MAYAR_RATE_LIMIT.requestsPerMinute;
  private readonly windowMs = MAYAR_RATE_LIMIT.windowMs;

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit();
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Mayar.id API Client
 */
export class MayarApiClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly rateLimiter = new RateLimiter();

  constructor() {
    this.baseUrl = mayarConfig.baseUrl;
    this.headers = getMayarHeaders();
  }

  /**
   * Make HTTP request to Mayar API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MayarApiResponse<T>> {
    await this.rateLimiter.checkLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Mayar API request failed:', error);
      throw error;
    }
  }

  // =============================================================================
  // PRODUCT METHODS
  // =============================================================================

  /**
   * Get all products with pagination
   */
  async getProducts(params: ProductListParams = {}): Promise<MayarApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.search) searchParams.append('search', params.search);

    const endpoint = `/product?${searchParams.toString()}`;
    return this.request<Product[]>(endpoint);
  }

  /**
   * Get products by type
   */
  async getProductsByType(params: ProductsByTypeParams): Promise<MayarApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const endpoint = `/product/type/${params.type}?${searchParams.toString()}`;
    return this.request<Product[]>(endpoint);
  }

  /**
   * Get product detail by ID
   */
  async getProduct(productId: string): Promise<MayarApiResponse<Product>> {
    return this.request<Product>(`/product/${productId}`);
  }

  /**
   * Close product
   */
  async closeProduct(productId: string): Promise<MayarApiResponse<void>> {
    return this.request<void>(`/product/close/${productId}`);
  }

  /**
   * Reopen product
   */
  async reopenProduct(productId: string): Promise<MayarApiResponse<void>> {
    return this.request<void>(`/product/open/${productId}`);
  }

  // =============================================================================
  // INVOICE METHODS
  // =============================================================================

  /**
   * Create new invoice
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<MayarApiResponse<Invoice>> {
    return this.request<Invoice>('/invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<MayarApiResponse<Invoice>> {
    return this.request<Invoice>(`/invoice/${invoiceId}`);
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId: string, data: Partial<CreateInvoiceRequest>): Promise<MayarApiResponse<Invoice>> {
    return this.request<Invoice>(`/invoice/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoiceId: string): Promise<MayarApiResponse<void>> {
    return this.request<void>(`/invoice/${invoiceId}`, {
      method: 'DELETE',
    });
  }

  // =============================================================================
  // PAYMENT REQUEST METHODS
  // =============================================================================

  /**
   * Create payment request
   */
  async createPaymentRequest(data: CreatePaymentRequestRequest): Promise<MayarApiResponse<PaymentRequest>> {
    return this.request<PaymentRequest>('/request-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get payment request by ID
   */
  async getPaymentRequest(requestId: string): Promise<MayarApiResponse<PaymentRequest>> {
    return this.request<PaymentRequest>(`/request-payment/${requestId}`);
  }

  // =============================================================================
  // CUSTOMER METHODS
  // =============================================================================

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerRequest): Promise<MayarApiResponse<Customer>> {
    return this.request<Customer>('/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<MayarApiResponse<Customer>> {
    return this.request<Customer>(`/customer/${customerId}`);
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, data: Partial<CreateCustomerRequest>): Promise<MayarApiResponse<Customer>> {
    return this.request<Customer>(`/customer/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =============================================================================
  // TRANSACTION METHODS
  // =============================================================================

  /**
   * Get transactions with filters
   */
  async getTransactions(params: TransactionListParams = {}): Promise<MayarApiResponse<Transaction[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const endpoint = `/transaction?${searchParams.toString()}`;
    return this.request<Transaction[]>(endpoint);
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<MayarApiResponse<Transaction>> {
    return this.request<Transaction>(`/transaction/${transactionId}`);
  }

  // =============================================================================
  // WEBHOOK METHODS
  // =============================================================================

  /**
   * Register webhook URL
   */
  async registerWebhook(data: RegisterWebhookRequest): Promise<MayarApiResponse<WebhookRegistration>> {
    return this.request<WebhookRegistration>('/webhook/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get webhook history
   */
  async getWebhookHistory(): Promise<MayarApiResponse<WebhookHistory[]>> {
    return this.request<WebhookHistory[]>('/webhook/history');
  }

  /**
   * Test webhook URL
   */
  async testWebhook(webhookId: string): Promise<MayarApiResponse<void>> {
    return this.request<void>(`/webhook/test/${webhookId}`, {
      method: 'POST',
    });
  }

  /**
   * Retry webhook delivery
   */
  async retryWebhook(historyId: string): Promise<MayarApiResponse<void>> {
    return this.request<void>(`/webhook/retry/${historyId}`, {
      method: 'POST',
    });
  }

  // =============================================================================
  // LICENSE METHODS
  // =============================================================================

  /**
   * Verify software license
   */
  async verifyLicense(data: VerifyLicenseRequest): Promise<MayarApiResponse<VerifyLicenseResponse>> {
    return this.request<VerifyLicenseResponse>('/license/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Activate license
   */
  async activateLicense(data: ActivateLicenseRequest): Promise<MayarApiResponse<void>> {
    return this.request<void>('/license/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deactivate license
   */
  async deactivateLicense(data: DeactivateLicenseRequest): Promise<MayarApiResponse<void>> {
    return this.request<void>('/license/deactivate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =============================================================================
  // COUPON METHODS
  // =============================================================================

  /**
   * Create new coupon
   */
  async createCoupon(data: CreateCouponRequest): Promise<MayarApiResponse<Coupon>> {
    return this.request<Coupon>('/coupon', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Apply coupon to amount
   */
  async applyCoupon(data: ApplyCouponRequest): Promise<MayarApiResponse<ApplyCouponResponse>> {
    return this.request<ApplyCouponResponse>('/coupon/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get coupon by code
   */
  async getCoupon(couponCode: string): Promise<MayarApiResponse<Coupon>> {
    return this.request<Coupon>(`/coupon/${couponCode}`);
  }
}

// Export singleton instance
export const mayarApi = new MayarApiClient();

// Export class for custom instances
export default MayarApiClient;