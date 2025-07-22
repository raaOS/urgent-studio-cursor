/**
 * @fileOverview Single source of truth for application-wide types and Zod schemas.
 * This ensures consistency between frontend forms, backend services, and AI flows.
 */
import { z } from 'zod';

// =================================
// Product & Cart
// =================================

export const ProductSchema = z.object({
  id: z.string(),
  tier: z.string(),
  name: z.string(),
  price: z.number(),
  promoPrice: z.number().optional(),
  imageUrl: z.string().optional(),
  // For carrying over existing brief data during editing
  instanceId: z.string().optional(),
  briefDetails: z.string().optional(),
  googleDriveAssetLinks: z.string().optional(),
  width: z.union([z.number(), z.literal('')]).optional(),
  height: z.union([z.number(), z.literal('')]).optional(),
  unit: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;


// =================================
// Brief
// =================================

export const BriefSchema = z.object({
  instanceId: z.string(),
  productId: z.string(),
  productName: z.string(),
  tier: z.string(),
  briefDetails: z.string().min(10, { message: "Brief harus diisi minimal 10 karakter." }),
  googleDriveAssetLinks: z.string().url({ message: "URL Google Drive tidak valid." }).optional().or(z.literal('')),
  width: z.number({invalid_type_error: 'Wajib diisi angka'}).positive().optional().or(z.literal('')),
  height: z.number({invalid_type_error: 'Wajib diisi angka'}).positive().optional().or(z.literal('')),
  unit: z.string().optional(),
});

export type Brief = z.infer<typeof BriefSchema>;


// =================================
// Order
// =================================

// Daftar status yang diizinkan untuk pesanan
export const OrderStatusEnum = z.enum([
    "Menunggu Pembayaran",
    "Pembayaran Sedang Diverifikasi",
    "Pesanan Diterima",
    "Brief Sedang Ditinjau",
    "Desain Sedang Dikerjakan",
    "Pesanan Selesai",
    "Dibatalkan",
]);

export const OrderSchema = z.object({
    id: z.string(),
    tier: z.string(),
    briefs: z.array(BriefSchema), // Briefs are now nested for type safety
    status: OrderStatusEnum,
    createdAt: z.string(), // Stored as ISO string
    updatedAt: z.string().optional(),
    subtotal: z.number(),
    handlingFee: z.number(),
    uniqueCode: z.number(),
    totalAmount: z.number(),
    statusHistory: z.record(z.string()), // Simple record of status to ISO date string
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerTelegram: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
