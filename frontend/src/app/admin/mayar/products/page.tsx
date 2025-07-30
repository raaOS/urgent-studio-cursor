'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Eye,
  Filter
} from 'lucide-react';
import { Product, ProductType, ProductStatus } from '@/types/mayar';

// Extended Product interface for admin management
interface ExtendedProduct extends Product {
  description: string;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  sku: string;
  stock: string;
}

export default function MayarProductsPage(): JSX.Element {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stock: ''
  });

  // Mock data untuk demo
  useEffect(() => {
    const mockProducts: ExtendedProduct[] = [
      {
        id: 'prod_001',
        name: 'Website Development Package',
        type: 'digital_product' as ProductType,
        status: 'active' as ProductStatus,
        category: 'Web Development',
        description: 'Complete website development with modern design',
        price: 5000000,
        sku: 'WEB-DEV-001',
        stock: 10,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'prod_002',
        name: 'Mobile App Development',
        type: 'digital_product' as ProductType,
        status: 'active' as ProductStatus,
        category: 'Mobile Development',
        description: 'Cross-platform mobile application development',
        price: 8000000,
        sku: 'MOB-DEV-001',
        stock: 5,
        isActive: true,
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      },
      {
        id: 'prod_003',
        name: 'UI/UX Design Service',
        type: 'digital_product' as ProductType,
        status: 'active' as ProductStatus,
        category: 'Design',
        description: 'Professional UI/UX design for web and mobile',
        price: 3000000,
        sku: 'UIUX-001',
        stock: 15,
        isActive: true,
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z'
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (): Promise<void> => {
    try {
      const newProduct: ExtendedProduct = {
        id: `prod_${Date.now()}`,
        name: formData.name,
        type: 'digital_product' as ProductType,
        status: 'active' as ProductStatus,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock: parseInt(formData.stock),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setProducts(prev => [...prev, newProduct]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async (): Promise<void> => {
    if (!editingProduct) return;

    try {
      const updatedProduct: ExtendedProduct = {
        ...editingProduct,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock: parseInt(formData.stock),
        updatedAt: new Date().toISOString()
      };

      setProducts(prev => 
        prev.map(p => p.id === editingProduct.id ? updatedProduct : p)
      );
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      sku: '',
      stock: ''
    });
  };

  const startEdit = (product: ExtendedProduct): void => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category || '',
      sku: product.sku,
      stock: product.stock.toString()
    });
    setShowCreateForm(true);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produk Mayar.id</h1>
            <p className="text-gray-600 mt-1">
              Kelola produk dan layanan untuk sistem pembayaran
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowCreateForm(true);
              setEditingProduct(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari produk berdasarkan nama, kategori, atau SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </CardTitle>
              <CardDescription>
                {editingProduct ? 'Perbarui informasi produk' : 'Buat produk baru untuk sistem pembayaran Mayar.id'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Masukkan SKU produk"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi produk"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Masukkan kategori"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  disabled={!formData.name || !formData.sku || parseFloat(formData.price) <= 0}
                >
                  {editingProduct ? 'Update Produk' : 'Simpan Produk'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={product.isActive ? "default" : "secondary"}
                    className={product.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {product.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Harga:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Kategori:</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stok:</span>
                    <span className={`text-sm font-medium ${
                      product.stock > 10 ? 'text-green-600' : 
                      product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stock} unit
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => startEdit(product)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {/* View details */}}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Coba ubah kata kunci pencarian Anda'
                  : 'Mulai dengan menambahkan produk pertama Anda'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}