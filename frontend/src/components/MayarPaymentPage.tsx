'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CreditCard, Smartphone, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { MayarApiClient } from '@/services/mayar-api';
import { Invoice, PaymentRequest } from '@/types/mayar';

interface MayarPaymentPageProps {
  orderId: string;
}

interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function MayarPaymentPage({ orderId }: MayarPaymentPageProps): JSX.Element {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  const mayarClient = new MayarApiClient();

  const loadOrderData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Mock order data - in real implementation, fetch from your backend
      const mockOrder: OrderData = {
        id: orderId,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+6281234567890',
        totalAmount: 500000,
        status: 'pending',
        items: [
          {
            productId: '1',
            productName: 'Logo Design Premium',
            quantity: 1,
            price: 500000
          }
        ]
      };
      setOrder(mockOrder);
    } catch (err) {
      setError('Gagal memuat data pesanan');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrderData();
  }, [orderId, loadOrderData]);

  const handlePaymentMethodSelect = (method: string): void => {
    setPaymentMethod(method);
  };

  const handleCreateInvoice = async (): Promise<void> => {
    if (!order) return;

    try {
      setIsProcessing(true);
      const response = await mayarClient.createInvoice({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        notes: `Pembayaran untuk pesanan #${order.id}`
      });
      
      if (response.data) {
        setInvoice(response.data);
      }
    } catch (err) {
      setError('Gagal membuat invoice');
      console.error('Error creating invoice:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePaymentRequest = async (): Promise<void> => {
    if (!order) return;

    try {
      setIsProcessing(true);
      const response = await mayarClient.createPaymentRequest({
        amount: order.totalAmount,
        description: `Payment request untuk pesanan #${order.id}`,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone
      });
      
      if (response.data) {
        setPaymentRequest(response.data);
      }
    } catch (err) {
      setError('Gagal membuat payment request');
      console.error('Error creating payment request:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'ewallet',
      name: 'E-Wallet',
      description: 'OVO, GoPay, DANA, LinkAja',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'virtual_account',
      name: 'Virtual Account',
      description: 'BCA, BNI, BRI, Mandiri',
      icon: <Building className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      description: 'Visa, Mastercard',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat halaman pembayaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Data pesanan tidak ditemukan
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pembayaran Mayar.id
            </h1>
            <p className="text-gray-600">
              Selesaikan pembayaran untuk pesanan #{order.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>
                  Detail pesanan #{order.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nama:</span>
                    <span className="text-sm font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telepon:</span>
                    <span className="text-sm font-medium">{order.customerPhone}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Item Pesanan:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {(invoice || paymentRequest) && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {invoice ? 'Invoice Dibuat' : 'Payment Request Dibuat'}
                    </Badge>
                  </div>
                  {invoice && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Invoice ID: {invoice.id}</p>
                      <p className="text-sm text-gray-600">Status: {invoice.status}</p>
                      <p className="text-sm text-gray-600">Total: Rp {invoice.total.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  {paymentRequest && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Payment Request ID: {paymentRequest.id}</p>
                      <p className="text-sm text-gray-600">Status: {paymentRequest.status}</p>
                      <Button 
                        className="mt-2" 
                        onClick={() => window.open(paymentRequest.paymentUrl, '_blank')}
                      >
                        Bayar Sekarang
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Metode Pembayaran</CardTitle>
                <CardDescription>
                  Pilih metode pembayaran yang Anda inginkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === method.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${method.color} text-white`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Proses Pembayaran</CardTitle>
                <CardDescription>
                  Pilih jenis pembayaran yang ingin dibuat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => void handleCreateInvoice()}
                  disabled={isProcessing || !!invoice}
                  className="w-full"
                  variant={invoice ? "secondary" : "default"}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {invoice ? 'Invoice Sudah Dibuat' : 'Buat Invoice'}
                </Button>

                <Button
                  onClick={() => void handleCreatePaymentRequest()}
                  disabled={isProcessing || !paymentMethod || !!paymentRequest}
                  className="w-full"
                  variant={paymentRequest ? "secondary" : "outline"}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  {paymentRequest ? 'Payment Request Sudah Dibuat' : 'Buat Payment Request'}
                </Button>

                {!paymentMethod && (
                  <p className="text-xs text-gray-500 text-center">
                    Pilih metode pembayaran untuk membuat Payment Request
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}