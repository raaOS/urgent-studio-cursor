import { ValidationException } from '@/lib/exceptions';
import { Product } from '@/lib/types';

import { createMultipleOrdersFromCart } from './orderService';

jest.mock('./backendservice', () => ({
  backendService: {
    createOrder: jest.fn().mockResolvedValue({ success: true, data: { id: 'order-123' } })
  }
}));

describe('createMultipleOrdersFromCart', () => {
  it('membuat order untuk setiap produk di cart', async () => {
    const cart = [
      { 
        id: 'p1', 
        name: 'Produk 1', 
        price: 10000, 
        category: 'jasa-satuan',
        imageUrl: 'test.jpg',
        features: ['feature1'],
        deliveryTime: '1-2 hari',
        revisions: 2,
        popular: false,
        description: 'Test product',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: 'p2', 
        name: 'Produk 2', 
        price: 20000, 
        category: 'jasa-satuan',
        imageUrl: 'test2.jpg',
        features: ['feature2'],
        deliveryTime: '2-3 hari',
        revisions: 3,
        popular: true,
        description: 'Test product 2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const orderIds = await createMultipleOrdersFromCart(cart as Product[]);
    
    // Pastikan result adalah array, bukan exception
    expect(Array.isArray(orderIds)).toBe(true);
    if (Array.isArray(orderIds)) {
      expect(orderIds.length).toBe(1); // 1 order for all products
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