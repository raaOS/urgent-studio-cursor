export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  features: string[];
  deliveryTime: string;
  revisions: number;
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  productCode: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  features: string[];
  deliveryTime: string;
  revisions: number;
  popular: boolean;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}