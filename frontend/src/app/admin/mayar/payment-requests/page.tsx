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
  ExternalLink,
  CreditCard,
  SlidersHorizontal,
  Calendar,
  Copy
} from 'lucide-react';
import { PaymentRequest } from '@/types/mayar';

interface PaymentRequestFormData {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  expiryDate: string;
}

export default function MayarPaymentRequestsPage(): JSX.Element {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingRequest, setEditingRequest] = useState<PaymentRequest | null>(null);
  const [formData, setFormData] = useState<PaymentRequestFormData>({
    amount: 0,
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    expiryDate: ''
  });

  // Mock data untuk demo
  useEffect(() => {
    const mockPaymentRequests: PaymentRequest[] = [
      {
        id: 'pr_001',
        amount: 2500000,
        description: 'Pembayaran konsultasi bisnis',
        customerName: 'Ahmad Rizki',
        customerEmail: 'ahmad@example.com',
        customerPhone: '+62812345678',
        status: 'pending',
        paymentUrl: 'https://mayar.id/payment/pr_001',
        expiryDate: '2024-02-15T23:59:59Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'pr_002',
        amount: 5000000,
        description: 'Pembayaran website development',
        customerName: 'Sari Dewi',
        customerEmail: 'sari@example.com',
        customerPhone: '+62812345679',
        status: 'paid',
        paymentUrl: 'https://mayar.id/payment/pr_002',
        expiryDate: '2024-02-20T23:59:59Z',
        paidAt: '2024-01-18T14:30:00Z',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-18T14:30:00Z'
      },
      {
        id: 'pr_003',
        amount: 1500000,
        description: 'Pembayaran maintenance bulanan',
        customerName: 'Budi Santoso',
        customerEmail: 'budi@example.com',
        customerPhone: '+62812345680',
        status: 'expired',
        paymentUrl: 'https://mayar.id/payment/pr_003',
        expiryDate: '2024-01-30T23:59:59Z',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-30T23:59:59Z'
      }
    ];

    setTimeout(() => {
      setPaymentRequests(mockPaymentRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = paymentRequests.filter(request =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRequest = async (): Promise<void> => {
    try {
      const newRequest: PaymentRequest = {
        id: `pr_${Date.now()}`,
        amount: formData.amount,
        description: formData.description,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        status: 'pending',
        paymentUrl: `https://mayar.id/payment/pr_${Date.now()}`,
        expiryDate: formData.expiryDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPaymentRequests(prev => [...prev, newRequest]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating payment request:', error);
    }
  };

  const handleUpdateRequest = async (): Promise<void> => {
    if (!editingRequest) return;

    try {
      const updatedRequest: PaymentRequest = {
        ...editingRequest,
        amount: formData.amount,
        description: formData.description,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        expiryDate: formData.expiryDate,
        updatedAt: new Date().toISOString()
      };

      setPaymentRequests(prev => 
        prev.map(req => req.id === editingRequest.id ? updatedRequest : req)
      );
      setEditingRequest(null);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error updating payment request:', error);
    }
  };

  const handleDeleteRequest = async (requestId: string): Promise<void> => {
    try {
      setPaymentRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error deleting payment request:', error);
    }
  };

  const resetForm = (): void => {
    setFormData({
      amount: 0,
      description: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      expiryDate: ''
    });
  };

  const startEdit = (request: PaymentRequest): void => {
    setEditingRequest(request);
    setFormData({
      amount: request.amount,
      description: request.description,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone || '',
      expiryDate: request.expiryDate?.split('T')[0] ?? ''
    });
    setShowCreateForm(true);
  };

  const copyPaymentUrl = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying URL:', error);
    }
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

  const getStatusColor = (status: PaymentRequest['status']): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: PaymentRequest['status']): string => {
    switch (status) {
      case 'paid': return 'Dibayar';
      case 'pending': return 'Menunggu';
      case 'expired': return 'Kedaluwarsa';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Unknown';
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Request Mayar.id</h1>
            <p className="text-gray-600 mt-1">
              Kelola permintaan pembayaran untuk pelanggan
            </p>
          </div>
          <Button 
            onClick={() => {
              setShowCreateForm(true);
              setEditingRequest(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Payment Request
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari payment request berdasarkan deskripsi, nama pelanggan, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
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
                {editingRequest ? 'Edit Payment Request' : 'Buat Payment Request Baru'}
              </CardTitle>
              <CardDescription>
                {editingRequest ? 'Perbarui informasi payment request' : 'Buat payment request baru untuk pelanggan'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="Masukkan jumlah pembayaran"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Tanggal Kedaluwarsa</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi pembayaran"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Pelanggan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Pelanggan</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Masukkan nama pelanggan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="Masukkan email pelanggan"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Nomor Telepon</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingRequest(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button onClick={editingRequest ? handleUpdateRequest : handleCreateRequest}>
                  {editingRequest ? 'Update' : 'Buat'} Payment Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Requests List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(request)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{formatPrice(request.amount)}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {request.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {request.customerName}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {request.customerEmail}
                  </div>
                  {request.customerPhone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {request.customerPhone}
                    </div>
                  )}
                  {request.expiryDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Kedaluwarsa: {formatDate(request.expiryDate)}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyPaymentUrl(request.paymentUrl)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(request.paymentUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada payment request
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai dengan membuat payment request pertama Anda
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Payment Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}