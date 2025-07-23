/**
 * @fileOverview Sistem penanganan error terpusat untuk service layer.
 *
 * File ini menyediakan fungsi-fungsi helper untuk menangani error secara konsisten
 * di seluruh service layer, termasuk transformasi error dari API ke AppException.
 */

import {
  AppException,
  ValidationException,
  NotFoundException,
  InternalServerException,
} from "@/lib/exceptions";

import { ApiResponse } from "./httpClient";

/**
 * Tipe untuk callback yang menangani error
 */
export type ErrorHandler<T> = (error: unknown) => T;

/**
 * Mengubah error dari API response menjadi AppException yang sesuai
 * @param response Response API yang gagal
 * @param defaultMessage Pesan default jika tidak ada pesan error
 * @param context Konteks tambahan untuk error
 */
export function transformApiError(
  response: ApiResponse<unknown>,
  defaultMessage: string = "Terjadi kesalahan pada server",
  context?: Record<string, unknown>
): AppException {
  // Jika ada pesan error spesifik dari API, gunakan itu
  const errorMessage = response.error ?? response.message ?? defaultMessage;

  // Tentukan jenis exception berdasarkan pola pada pesan error
  if (
    errorMessage.toLowerCase().includes("not found") ||
    errorMessage.toLowerCase().includes("tidak ditemukan")
  ) {
    return new NotFoundException(errorMessage, context);
  }

  if (
    errorMessage.toLowerCase().includes("validation") ||
    errorMessage.toLowerCase().includes("validasi") ||
    errorMessage.toLowerCase().includes("invalid") ||
    errorMessage.toLowerCase().includes("tidak valid")
  ) {
    return new ValidationException(errorMessage, context);
  }

  // Default ke InternalServerException
  return new InternalServerException(errorMessage, context);
}

/**
 * Fungsi helper untuk menangani error secara konsisten di service layer
 * @param error Error yang ditangkap
 * @param defaultMessage Pesan default jika error tidak dikenali
 * @param context Konteks tambahan untuk error
 */
export function handleServiceError(
  error: unknown,
  defaultMessage: string = "Terjadi kesalahan pada server",
  context?: Record<string, unknown>
): AppException {
  // Jika error sudah berupa AppException, kembalikan langsung
  if (error instanceof AppException) {
    return error;
  }

  // Jika error adalah Error bawaan JavaScript
  if (error instanceof Error) {
    return new InternalServerException(error.message || defaultMessage, {
      ...context,
      originalError: error.message,
      stack: error.stack,
    });
  }

  // Untuk error yang tidak dikenali
  return new InternalServerException(defaultMessage, {
    ...context,
    originalError: String(error),
  });
}

/**
 * Fungsi wrapper untuk mencoba eksekusi fungsi dan menangani error secara konsisten
 * @param fn Fungsi yang akan dieksekusi
 * @param errorHandler Fungsi untuk menangani error
 */
export async function tryCatch<T, R>(
  fn: () => Promise<T>,
  errorHandler: ErrorHandler<R>
): Promise<T | R> {
  try {
    return await fn();
  } catch (error) {
    return errorHandler(error);
  }
}
