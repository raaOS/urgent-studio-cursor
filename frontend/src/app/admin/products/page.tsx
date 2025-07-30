'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { ProductService } from '@/services/productService';
import { Product } from '@/types/product';

type FormMode = 'create' | 'edit' | 'view';

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  features: string[];
  deliveryTime: string;
  revisions: number;
  popular: boolean;
  productCode: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  features: [],
  deliveryTime: '',
  revisions: 0,
  popular: false,
  productCode: '',
};

export default function ProductsAdminPage(): JSX.Element {
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [loading, setLoading] = useState<boolean>(true);
  const [featureInput, setFeatureInput] = useState<string>('');

  // Fetch products on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const productService = new ProductService();
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'revisions' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (checked: boolean): void => {
    setFormData(prev => ({
      ...prev,
      popular: checked,
    }));
  };

  const handleSelectChange = (value: string): void => {
    setFormData(prev => ({
      ...prev,
      category: value,
    }));
  };

  const handleAddFeature = (): void => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProduct = (): void => {
    setFormData(initialFormData);
    setFormMode('create');
  };

  const handleEditProduct = (product: Product): void => {
    // Convert features from backend format to form format
    let features: string[] = [];
    if (Array.isArray(product.features)) {
      features = product.features as string[];
    } else if (typeof product.features === 'object' && product.features !== null) {
      // Handle case where features is a JSON object
      features = Object.values(product.features).map(item => String(item));
    }

    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      features,
      deliveryTime: product.deliveryTime,
      revisions: product.revisions,
      popular: product.popular,
      productCode: product.productCode || '',
    });
    setFormMode('edit');
  };

  const handleDeleteProduct = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const productService = new ProductService();
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const productService = new ProductService();
      if (formMode === 'create') {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      } else if (formMode === 'edit' && formData.id) {
        await productService.updateProduct(formData.id, formData);
        toast.success('Product updated successfully');
      }
      setFormMode('view');
      fetchProducts();
    } catch (error) {
      toast.error(`Failed to ${formMode === 'create' ? 'create' : 'update'} product`);
      console.error(error);
    }
  };

  const handleCancel = (): void => {
    setFormData(initialFormData);
    setFormMode('view');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading</CardTitle>
            <CardDescription className="text-center">Verifying authentication...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if not logged in is handled by middleware
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        {formMode === 'view' && (
          <Button onClick={handleCreateProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        )}
      </div>

      {formMode !== 'view' ? (
        <Card>
          <CardHeader>
            <CardTitle>{formMode === 'create' ? 'Create New Product' : 'Edit Product'}</CardTitle>
            <CardDescription>
              {formMode === 'create' ? 'Add a new product to your catalog' : 'Update product details'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (IDR)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kaki-lima">Budget Kaki Lima</SelectItem>
                      <SelectItem value="umkm">Budget UMKM</SelectItem>
                      <SelectItem value="ecommerce">Budget E-commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revisions">Revisions</Label>
                  <Input
                    id="revisions"
                    name="revisions"
                    type="number"
                    value={formData.revisions}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="popular"
                      checked={formData.popular}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="popular">Mark as Popular</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex space-x-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                  />
                  <Button type="button" onClick={handleAddFeature}>
                    Add
                  </Button>
                </div>
                <ul className="mt-2 space-y-1">
                  {formData.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {formMode === 'create' ? 'Create Product' : 'Update Product'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4">No products found. Create your first product!</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.popular ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}