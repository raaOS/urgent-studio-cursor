'use client';

import { z } from 'zod';

import { ValidationException } from '../lib/exceptions';

import { backendService } from './backendservice';
import { tryCatch } from './errorHandler';

// Skema validasi untuk settings
export const ControlSettingsSchema = z.object({
  productLimitWeekly: z.number().int().nonnegative('Batas produk mingguan harus berupa angka non-negatif'),
  revenueTarget: z.number().nonnegative('Target pendapatan harus berupa angka non-negatif')
});

// Type untuk settings berdasarkan skema Zod
export type ControlSettings = z.infer<typeof ControlSettingsSchema>;

// Nilai default untuk settings
export const DEFAULT_SETTINGS: ControlSettings = {
  productLimitWeekly: 0,
  revenueTarget: 0
};

/**
 * Mendapatkan pengaturan kontrol dari backend
 * 
 * @returns Promise dengan pengaturan kontrol yang divalidasi
 * @throws AppException jika terjadi error yang tidak dapat ditangani
 */
export async function getControlSettings(): Promise<ControlSettings> {
  return await tryCatch<ControlSettings, ControlSettings>(
    async () => {
      const response = await backendService.getSettings();
      
      if (response.success !== true || response.data === undefined || response.data === null) {
        console.warn('Tidak ada data pengaturan yang diterima dari server, menggunakan nilai default');
        return DEFAULT_SETTINGS;
      }
      
      try {
        // Validasi data pengaturan
        return ControlSettingsSchema.parse(response.data);
      } catch (validationError) {
        console.warn('Data pengaturan tidak valid:', validationError);
        // Jika validasi gagal, coba ambil nilai yang valid dan gunakan default untuk yang tidak valid
        const settings = { ...DEFAULT_SETTINGS };
        
        // Ambil nilai yang valid
        if (typeof response.data.productLimitWeekly === 'number' && response.data.productLimitWeekly >= 0) {
          settings.productLimitWeekly = response.data.productLimitWeekly;
        }
        
        if (typeof response.data.revenueTarget === 'number' && response.data.revenueTarget >= 0) {
          settings.revenueTarget = response.data.revenueTarget;
        }
        
        return settings;
      }
    },
    (error) => {
      console.error('Gagal mengambil pengaturan dari backend:', error);
      // Kembalikan nilai default jika terjadi error
      return DEFAULT_SETTINGS;
    }
  );
}

/**
 * Memperbarui pengaturan kontrol di backend
 * 
 * @param settings - Pengaturan kontrol yang akan diperbarui
 * @returns Promise dengan status keberhasilan
 * @throws AppException jika validasi gagal atau terjadi error yang tidak dapat ditangani
 */
export async function updateControlSettings(settings: ControlSettings): Promise<boolean> {
  return await tryCatch<boolean, boolean>(
    async () => {
      // Validasi pengaturan sebelum dikirim ke backend
      const validatedSettings = ControlSettingsSchema.parse(settings);
      
      // Kirim ke backend
      const response = await backendService.updateSettings(validatedSettings);
      
      if (response.success !== true) {
        throw new ValidationException(
          'Gagal memperbarui pengaturan di backend', 
          { response }
        );
      }
      
      return true;
    },
    (error) => {
      // Tangani error
      console.error('Gagal memperbarui pengaturan di backend:', error);
      
      // Return false instead of throwing
      return false;
    }
  );
}