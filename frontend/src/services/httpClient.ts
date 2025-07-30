// HTTP Client for API requests - Simple implementation
import logger from './logger';
import { getAuthToken } from '../lib/auth';

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  error?: string;
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();
    const method = options.method || 'GET';
    
    // Log request start
    logger.debug('HTTP Request Started', {
      method,
      url,
      endpoint,
      headers: options.headers,
    });

    // Get auth token and add to headers if available
    const authToken = getAuthToken();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    // Merge with provided headers
    const finalHeaders = {
      ...defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      const duration = performance.now() - startTime;

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}`;
        
        // Log failed request
        logger.error('HTTP Request Failed', {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          duration,
        }, new Error(errorMessage));

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Log successful request
      logger.apiCall(method, url, response.status, duration);
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log request error
      logger.error('HTTP Request Error', {
        method,
        url,
        duration,
        errorMessage,
      }, error instanceof Error ? error : new Error(errorMessage));

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    // Log request data (excluding sensitive information)
    logger.debug('POST Request Data', {
      endpoint,
      hasData: !!data,
      dataType: typeof data,
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    // Log request data (excluding sensitive information)
    logger.debug('PUT Request Data', {
      endpoint,
      hasData: !!data,
      dataType: typeof data,
    });

    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    logger.debug('DELETE Request', {
      endpoint,
    });

    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance
export const httpClient = new HttpClient();