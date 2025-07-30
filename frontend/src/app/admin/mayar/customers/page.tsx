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
  User,
  Mail,
  Phone,
  MapPin,
  Filter,
  Eye,
  Users,
  CreditCard,
  FileText
} from 'lucide-react';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface ExtendedCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, unknown>;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  notes?: string;
}

export default function MayarCustomersPage(): JSX.Element {
  const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<ExtendedCustomer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Mock data untuk demo
  useEffect(() => {
    const mockCustomers: ExtendedCustomer[] = [
      {
        id: 'cust_001',
        name: 'Ahmad Rizki Pratama',
        email: 'ahmad.rizki@example.com',
        phone: '+62812345678',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        notes: 'Pelanggan VIP, sering order design premium',
        totalOrders: 15,
        totalSpent: 25000000,
        lastOrderDate: '2024-01-20T10:00:00Z',
        createdAt: '2023-06-15T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 'cust_002',
        name: 'Sari Dewi Lestari',
        email: 'sari.dewi@example.com',
        phone: '+62812345679',
        address: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
        notes: 'Startup founder, butuh branding package',
        totalOrders: 8,
        totalSpent: 12000000,
        lastOrderDate: '2024-01-18T14:30:00Z',
        createdAt: '2023-08-20T10:00:00Z',
        updatedAt: '2024-01-18T14:30:00Z'
      },
      {
        id: 'cust_003',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        phone: '+62812345680',
        address: 'Jl. Thamrin No. 789, Jakarta Pusat',
        notes: 'Perusahaan besar, order rutin setiap bulan',
        totalOrders: 25,
        totalSpent: 45000000,
        lastOrderDate: '2024-01-22T09:15:00Z',
        createdAt: '2023-03-10T10:00:00Z',
        updatedAt: '2024-01-22T09:15:00Z'
      },
      {
        id: 'cust_004',
        name: 'Maya Indira',
        email: 'maya.indira@example.com',
        phone: '+62812345681',
        address: 'Jl. Kemang Raya No. 321, Jakarta Selatan',
        notes: 'Influencer, butuh konten visual menarik',
        totalOrders: 5,
        totalSpent: 7500000,
        lastOrderDate: '2024-01-15T16:45:00Z',
        createdAt: '2023-11-05T10:00:00Z',
        updatedAt: '2024-01-15T16:45:00Z'
      }
    ];

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleCreateCustomer = async (): Promise<void> => {
    try {
      const newCustomer: ExtendedCustomer = {
        id: `cust_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCustomers(prev => [...prev, newCustomer]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleUpdateCustomer = async (): Promise<void> => {
    if (!editingCustomer) return;

    try {
      const updatedCustomer: ExtendedCustomer = {
        ...editingCustomer,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };

      setCustomers(prev => 
        prev.map(customer => customer.id === editingCustomer.id ? updatedCustomer : customer)
      );
      setEditingCustomer(null);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string): Promise<void> => {
    try {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const startEdit = (customer: ExtendedCustomer): void => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowCreateForm(true);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCustomerLevel = (totalSpent: number): { level: string; color: string } => {
    if (totalSpent >= 30000000) {
      return { level: 'VIP', color: 'bg-purple-100 text-purple-800' };
    } else if (totalSpent >= 15000000) {
      return { level: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    } else if (totalSpent >= 5000000) {
      return { level: 'Silver', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { level: 'Bronze', color: 'bg-orange-100 text-orange-800' };
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Pelanggan Mayar.id</h1>
            <p className="text-gray-600 mt-1">
              Kelola data pelanggan dan riwayat transaksi
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowCreateForm(true);
              setEditingCustomer(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                  <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(
                      customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) /
                      Math.max(customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0), 1)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari pelanggan berdasarkan nama, email, atau nomor telepon..."
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
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
              </CardTitle>
              <CardDescription>
                {editingCustomer ? 'Perbarui informasi pelanggan' : 'Tambahkan pelanggan baru ke database'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Masukkan alamat email"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan tentang pelanggan (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button 
                  onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
                  disabled={!formData.name || !formData.email}
                >
                  {editingCustomer ? 'Update Pelanggan' : 'Simpan Pelanggan'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCustomer(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const customerLevel = getCustomerLevel(customer.totalSpent || 0);
            return (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={customerLevel.color}
                    >
                      {customerLevel.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Spent:</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(customer.totalSpent || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Orders:</span>
                      <span className="text-sm font-medium">
                        {customer.totalOrders || 0} order{(customer.totalOrders || 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                    {customer.lastOrderDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Last Order:</span>
                        <span className="text-sm font-medium">
                          {formatDate(customer.lastOrderDate)}
                        </span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start text-sm text-gray-500 mt-2">
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    )}
                    {customer.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Notes: </span>
                        {customer.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => startEdit(customer)}
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
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Coba ubah kata kunci pencarian Anda'
                  : 'Mulai dengan menambahkan pelanggan pertama Anda'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pelanggan Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}