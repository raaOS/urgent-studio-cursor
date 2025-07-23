import { ValidationException } from '@/lib/exceptions';
import { Product } from '@/lib/types';

import { createMultipleOrdersFromCart } from './orderService';

jest.mock('./backendservice', () => ({
  backendService: {
    createOrder: jest.fn().mockResolvedValue({ success: true, data: { id: 'order-123' } })
  }
}));

describe('createMultipleOrdersFromCart', () => {
  it('membuat order untuk setiap tier di cart', async () => {
    const cart = [
      { 
        id: 'p1', 
        name: 'Produk 1', 
        price: 10000, 
        promoPrice: 9000, 
        tier: 'Kaki Lima', 
        instanceId: 'i1', 
        briefDetails: { description: 'Deskripsi cukup panjang' }, 
        googleDriveAssetLinks: ['https://drive.google.com/file/d/abc123'], 
        width: 10, 
        height: 10, 
        unit: 'px' 
      },
      { 
        id: 'p2', 
        name: 'Produk 2', 
        price: 20000, 
        tier: 'UMKM', 
        instanceId: 'i2', 
        briefDetails: { description: 'Deskripsi cukup panjang' }, 
        googleDriveAssetLinks: ['https://drive.google.com/file/d/abc123'], 
        width: 10, 
        height: 10, 
        unit: 'px' 
      },
      { 
        id: 'p3', 
        name: 'Produk 3', 
        price: 30000, 
        tier: 'Kaki Lima', 
        instanceId: 'i3', 
        briefDetails: { description: 'Deskripsi cukup panjang' }, 
        googleDriveAssetLinks: ['https://drive.google.com/file/d/abc123'], 
        width: 10, 
        height: 10, 
        unit: 'px' 
      },
    ];
    // Konversi cart ke tipe Product yang benar dengan mengubah briefDetails menjadi string
    const convertedCart = cart.map(item => ({
      ...item,
      briefDetails: typeof item.briefDetails === 'object' ? JSON.stringify(item.briefDetails) : item.briefDetails,
      googleDriveAssetLinks: Array.isArray(item.googleDriveAssetLinks) ? item.googleDriveAssetLinks[0] : undefined
    }));
    
    const orderIds = await createMultipleOrdersFromCart(convertedCart as unknown as Product[]);
    
    // Pastikan result adalah array, bukan exception
    expect(Array.isArray(orderIds)).toBe(true);
    if (Array.isArray(orderIds)) {
      expect(orderIds.length).toBe(2); // 2 tier
      expect(orderIds[0]).toBe('order-123');
    }
  });

  it('return ValidationException jika cart kosong', async () => {
    const result = await createMultipleOrdersFromCart([]);
    expect(result instanceof ValidationException).toBe(true);
    if (result instanceof ValidationException) {
      expect(result.message).toContain('Keranjang tidak boleh kosong');
    }
  });
});