import { z } from 'zod';
import { httpClient, ApiResponse } from './httpClient';
import { Product } from '@/types/product';

// Define the raw Product schema from backend (features might be object or array)
const RawProductSchema = z.object({
  id: z.string(),
  productCode: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  imageUrl: z.string(),
  features: z.array(z.string()).or(z.record(z.unknown())),
  deliveryTime: z.string(),
  revisions: z.number(),
  popular: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
});

type RawProduct = z.infer<typeof RawProductSchema>;

// Define the ProductService class
export class ProductService {
  private readonly baseEndpoint: string;

  constructor() {
    this.baseEndpoint = '/api/products';
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    const response = await httpClient.get<RawProduct[]>(this.baseEndpoint);
    if (!response.data) {
      throw new Error('Tidak ada data produk yang diterima dari server');
    }
    return this.validateAndTransformProducts(response.data);
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await httpClient.get<RawProduct>(`${this.baseEndpoint}/${id}`);
    if (!response.data) {
      throw new Error(`Produk dengan ID ${id} tidak ditemukan`);
    }
    return this.validateAndTransformProduct(response.data);
  }

  /**
   * Get a product by product code
   */
  async getProductByCode(code: string): Promise<Product> {
    const response = await httpClient.get<RawProduct>(`${this.baseEndpoint}/code/${code}`);
    if (!response.data) {
      throw new Error(`Produk dengan kode ${code} tidak ditemukan`);
    }
    return this.validateAndTransformProduct(response.data);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await httpClient.get<RawProduct[]>(`${this.baseEndpoint}/category/${category}`);
    if (!response.data) {
      throw new Error(`Tidak ada produk dalam kategori ${category}`);
    }
    return this.validateAndTransformProducts(response.data);
  }

  /**
   * Create a new product (admin only)
   */
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await httpClient.post<RawProduct>(this.baseEndpoint, product);
    if (!response.data) {
      throw new Error('Gagal membuat produk baru');
    }
    return this.validateAndTransformProduct(response.data);
  }

  /**
   * Update an existing product (admin only)
   */
  async updateProduct(id: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await httpClient.put<RawProduct>(`${this.baseEndpoint}/${id}`, product);
    if (!response.data) {
      throw new Error(`Gagal memperbarui produk dengan ID ${id}`);
    }
    return this.validateAndTransformProduct(response.data);
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<Record<string, unknown>>>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error(`Gagal menghapus produk dengan ID ${id}`);
    }
  }

  /**
   * Transform features from backend format to frontend format
   */
  private transformFeatures(features: string[] | Record<string, unknown>): string[] {
    if (Array.isArray(features)) {
      return features;
    }
    
    // If features is an object, convert values to string array
    if (typeof features === 'object' && features !== null) {
      return Object.values(features).map(item => String(item));
    }
    
    return [];
  }

  /**
   * Validate and transform a single product response
   */
  private validateAndTransformProduct(data: unknown): Product {
    try {
      const rawProduct = RawProductSchema.parse(data);
      return {
        ...rawProduct,
        features: this.transformFeatures(rawProduct.features),
        createdAt: typeof rawProduct.createdAt === 'string' ? rawProduct.createdAt : rawProduct.createdAt.toISOString(),
        updatedAt: typeof rawProduct.updatedAt === 'string' ? rawProduct.updatedAt : rawProduct.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Product validation error:', error);
      throw new Error('Invalid product data received from server');
    }
  }

  /**
   * Validate and transform an array of products
   */
  private validateAndTransformProducts(data: unknown): Product[] {
    try {
      const rawProducts = z.array(RawProductSchema).parse(data);
      return rawProducts.map(rawProduct => ({
        ...rawProduct,
        features: this.transformFeatures(rawProduct.features),
        createdAt: typeof rawProduct.createdAt === 'string' ? rawProduct.createdAt : rawProduct.createdAt.toISOString(),
        updatedAt: typeof rawProduct.updatedAt === 'string' ? rawProduct.updatedAt : rawProduct.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Products validation error:', error);
      throw new Error('Invalid products data received from server');
    }
  }
}

// Create a singleton instance
export const productService = new ProductService();