'use client';

import { z } from 'zod';

import { ValidationException } from '../lib/exceptions';

import { backendService } from './backendservice';
import { tryCatch } from './errorHandler';

export type LogType = 'telegram' | 'general' | 'error';
export type LogStatus = 'success' | 'error' | 'info';
export type LogContext = Record<string, unknown>;

// Skema validasi untuk LogEntry
export const LogEntrySchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  type: z.enum(['telegram', 'general', 'error']),
  status: z.enum(['success', 'error', 'info']),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
  context: z.record(z.unknown()).optional()
});

// Skema validasi untuk input log baru
export const CreateLogSchema = z.object({
  message: z.string().min(1, 'Pesan log tidak boleh kosong'),
  type: z.enum(['telegram', 'general', 'error']).default('general'),
  status: z.enum(['success', 'error', 'info']).default('info'),
  context: z.record(z.unknown()).optional(),
  error: z.string().optional()
});

export type LogEntry = z.infer<typeof LogEntrySchema>;
export type CreateLogInput = z.infer<typeof CreateLogSchema>;

/**
 * Menambahkan log baru ke backend
 * @param message - Pesan log
 * @param type - Tipe log (telegram, general, error)
 * @param status - Status log (success, error, info)
 * @param context - Konteks tambahan (opsional)
 * @param error - Error object atau string (opsional)
 * @returns Promise dengan ID log yang dibuat atau throws AppException
 */
export async function addLog(
  message: string,
  type: LogType = 'general',
  status: LogStatus = 'info',
  context?: LogContext,
  error?: Error | string
): Promise<string> {
  return await tryCatch<string, string>(
    async () => {
      // Validasi input
      const logInput = CreateLogSchema.parse({
        message,
        type,
        status,
        context: context ?? {},
        error: error instanceof Error ? error.message : error
      });
      
      // Kirim ke backend
      const response = await backendService.createLog(logInput);
      
      if (!response.success || !response.data) {
        throw new ValidationException(
          'Gagal menambahkan log ke backend', 
          { response }
        );
      }
      
      return response.data.id;
    },
    (error) => {
      // Tangani error dan log ke console (tapi jangan buat log baru untuk menghindari loop)
      console.error('Error saat menambahkan log:', error);
      // Return empty string instead of throwing
      return '';
    }
  );
}

/**
 * Mendapatkan log dari backend dengan polling
 * 
 * Catatan: Implementasi ini tidak menggunakan listener real-time karena backend Go
 * tidak mendukung fitur tersebut. Sebagai gantinya, kita menggunakan polling sederhana.
 * 
 * @param limitCount - Jumlah log yang akan diambil
 * @param callback - Fungsi callback yang akan dipanggil dengan data log
 * @param pollingInterval - Interval polling dalam milidetik (default: 10000ms)
 * @returns Fungsi untuk membersihkan interval polling
 */
export async function getLogsWithListener(
  limitCount: number = 50,
  callback: (logs: LogEntry[]) => void,
  pollingInterval: number = 10000
): Promise<() => void> {
  // Validasi parameter
  if (limitCount <= 0) {
    throw new ValidationException(
      'Jumlah log harus lebih besar dari 0',
      { limitCount }
    );
  }
  
  if (pollingInterval < 1000) {
    console.warn('Polling interval terlalu cepat, minimum 1000ms disarankan');
  }
  
  // Fungsi untuk mengambil log
  const fetchLogs = async (): Promise<undefined> => {
    await tryCatch<undefined, undefined>(
      async () => {
        const response = await backendService.getLogs();
        
        if (response.success && response.data) {
          // Validasi data log
          const validatedLogs = response.data.map(log => {
            try {
              // Validasi setiap log entry
              return LogEntrySchema.parse(log);
            } catch (validationError) {
              console.warn('Log entry tidak valid:', validationError, log);
              // Kembalikan log asli jika validasi gagal
              return log as unknown as LogEntry;
            }
          });
          
          callback(validatedLogs);
        } else {
          console.warn('Tidak ada data log yang diterima dari server');
          callback([]);
        }
        return undefined;
      },
      (error) => {
        console.error('Error saat mengambil log:', error);
        // Jangan throw error di sini, cukup log ke console dan panggil callback dengan array kosong
        callback([]);
        return undefined; // Return undefined
      }
    );
  };
  
  // Panggil sekali di awal
  void fetchLogs();
  
  // Setup polling dengan interval yang ditentukan
  const intervalId = setInterval(fetchLogs, pollingInterval);
  
  // Kembalikan fungsi untuk membersihkan interval
  return () => clearInterval(intervalId);
}