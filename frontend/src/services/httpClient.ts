'use client';

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

import { AppException, ValidationException, NotFoundException, InternalServerException } from '@/lib/exceptions';

// Definisi interface untuk respons API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  errorCode?: string;
}

// Konfigurasi default untuk axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// Membuat instance axios dengan konfigurasi default
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 detik timeout
});

// Interceptor untuk request
httpClient.interceptors.request.use(
  (config) => {
    // Tambahkan token atau header lain jika diperlukan di masa depan
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Tangani error secara global
    console.error('API Error:', error);
    
    // Transformasi error Axios menjadi AppException
    if (error.response) {
      // Server merespons dengan status error
      const { status } = error.response;
      const errorData = error.response.data as Record<string, unknown>;
      const message = (errorData?.message as string) ?? (errorData?.error as string) ?? 'Terjadi kesalahan pada server';
      const errorCode = (errorData?.errorCode as string) ?? 'UNKNOWN_ERROR';
      
      // Buat AppException berdasarkan status code
      switch (status) {
        case 400:
          return Promise.reject(new ValidationException(message, { errorCode, originalError: error }));
        case 404:
          return Promise.reject(new NotFoundException(message, { errorCode }));
        case 500:
        default:
          return Promise.reject(new InternalServerException(message, { errorCode, originalError: error }));
      }
    } else if (error.request !== null && error.request !== undefined) {
      // Request dibuat tapi tidak ada respons
      return Promise.reject(new InternalServerException(
        'Tidak dapat terhubung ke server', 
        { errorCode: 'SERVER_UNREACHABLE' }
      ));
    } else {
      // Error saat setup request
      const errorMessage = error instanceof Error && error.message !== null && error.message !== undefined && error.message !== "" ? error.message : 'Terjadi kesalahan saat mempersiapkan request';
      return Promise.reject(new AppException(
        500,
        errorMessage, 
        'REQUEST_SETUP_ERROR',
        { originalError: errorMessage }
      ));
    }
  }
);

// Fungsi helper untuk membuat respons API yang konsisten
export const createApiResponse = <T>(
  success: boolean, 
  data?: T, 
  message?: string, 
  error?: string, 
  statusCode?: number,
  errorCode?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success
  };
  
  // Only add properties if they exist
  if (message !== undefined) {
    response.message = message;
  }
  if (error !== undefined) {
    response.error = error;
  }
  if (statusCode !== undefined) {
    response.statusCode = statusCode;
  }
  if (errorCode !== undefined) {
    response.errorCode = errorCode;
  }
  
  // Only add data if it exists
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
};

// Fungsi helper untuk HTTP requests
export const api = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.get<T>(url);
      return createApiResponse<T>(true, response.data, 'Data berhasil diambil');
    } catch (error: unknown) {
      // Tangani error berdasarkan jenisnya
      if (error instanceof AppException) {
        return createApiResponse<T>(
          false, 
          undefined, 
          error.message, 
          error.message, 
          error.statusCode, 
          error.errorCode
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
        return createApiResponse<T>(
          false, 
          undefined, 
          'Gagal mengambil data', 
          errorMessage,
          500
        );
      }
    }
  },

  async post<T, D = Record<string, unknown>>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.post<T>(url, data);
      return createApiResponse<T>(true, response.data, 'Data berhasil dibuat');
    } catch (error: unknown) {
      // Tangani error berdasarkan jenisnya
      if (error instanceof AppException) {
        return createApiResponse<T>(
          false, 
          undefined, 
          error.message, 
          error.message, 
          error.statusCode, 
          error.errorCode
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
        return createApiResponse<T>(
          false, 
          undefined, 
          'Gagal membuat data', 
          errorMessage,
          500
        );
      }
    }
  },

  async put<T, D = Record<string, unknown>>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.put<T>(url, data);
      return createApiResponse<T>(true, response.data, 'Data berhasil diperbarui');
    } catch (error: unknown) {
      // Tangani error berdasarkan jenisnya
      if (error instanceof AppException) {
        return createApiResponse<T>(
          false, 
          undefined, 
          error.message, 
          error.message, 
          error.statusCode, 
          error.errorCode
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
        return createApiResponse<T>(
          false, 
          undefined, 
          'Gagal memperbarui data', 
          errorMessage,
          500
        );
      }
    }
  },

  async patch<T, D = Record<string, unknown>>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.patch<T>(url, data);
      return createApiResponse<T>(true, response.data, 'Data berhasil diperbarui');
    } catch (error: unknown) {
      // Tangani error berdasarkan jenisnya
      if (error instanceof AppException) {
        return createApiResponse<T>(
          false, 
          undefined, 
          error.message, 
          error.message, 
          error.statusCode, 
          error.errorCode
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
        return createApiResponse<T>(
          false, 
          undefined, 
          'Gagal memperbarui data', 
          errorMessage,
          500
        );
      }
    }
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.delete<T>(url);
      return createApiResponse<T>(true, response.data, 'Data berhasil dihapus');
    } catch (error: unknown) {
      // Tangani error berdasarkan jenisnya
      if (error instanceof AppException) {
        return createApiResponse<T>(
          false, 
          undefined, 
          error.message, 
          error.message, 
          error.statusCode, 
          error.errorCode
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
        return createApiResponse<T>(
          false, 
          undefined, 
          'Gagal menghapus data', 
          errorMessage,
          500
        );
      }
    }
  }
};

export default httpClient;