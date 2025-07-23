/**
 * @fileOverview Skema validasi terpusat untuk service layer.
 * 
 * File ini menyediakan skema validasi Zod yang digunakan di seluruh service layer
 * untuk memastikan konsistensi validasi data input dan output.
 */

import { z } from 'zod';

import { OrderSchema, OrderStatusEnum, ProductSchema, BriefSchema } from '@/lib/types';

/**
 * Skema untuk validasi data pelanggan pada pesanan
 */
export const CustomerInfoSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus minimal 3 karakter' }),
  phone: z.string().min(10, { message: 'Nomor telepon harus minimal 10 digit' }),
  telegram: z.string().min(3, { message: 'Username Telegram harus minimal 3 karakter' }),
  address: z.string().min(10, { message: 'Alamat harus minimal 10 karakter' }),
});

/**
 * Tipe untuk data pelanggan
 */
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;

/**
 * Skema untuk validasi pembaruan status pesanan
 */
export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid({ message: 'ID pesanan harus berupa UUID yang valid' }),
  status: OrderStatusEnum,
  notes: z.string().optional(),
});

/**
 * Tipe untuk data pembaruan status pesanan
 */
export type UpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;

/**
 * Skema untuk validasi konfirmasi pembayaran
 */
export const ConfirmPaymentSchema = z.object({
  orderIds: z.array(
    z.string().uuid({ message: 'ID pesanan harus berupa UUID yang valid' })
  ).min(1, { message: 'Minimal harus ada 1 ID pesanan' }),
  paymentProofUrl: z.string().url({ message: 'URL bukti pembayaran tidak valid' }).optional(),
  notes: z.string().optional(),
});

/**
 * Tipe untuk data konfirmasi pembayaran
 */
export type ConfirmPayment = z.infer<typeof ConfirmPaymentSchema>;

/**
 * Skema untuk validasi pembuatan pesanan
 */
export const CreateOrderSchema = z.object({
  tier: z.string(),
  briefs: z.array(
    z.object({
      instanceId: z.string(),
      productId: z.string(),
      productName: z.string(),
      tier: z.string(),
      briefDetails: z.record(z.string()),
      googleDriveAssetLinks: z.array(z.string()).optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.string().optional(),
    })
  ),
  subtotal: z.number(),
  handlingFee: z.number(),
  uniqueCode: z.number(),
  totalAmount: z.number(),
  customerInfo: CustomerInfoSchema.optional(),
});

/**
 * Tipe untuk data pembuatan pesanan
 */
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

/**
 * Re-export skema dari types.ts untuk kemudahan akses
 */
export { OrderSchema, ProductSchema, BriefSchema };