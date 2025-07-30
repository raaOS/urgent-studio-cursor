"use client";

import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Clock, 
  CreditCard,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface BriefData {
  productId: string;
  productName: string;
  tier: 'basic' | 'standard' | 'premium';
  price: number;
  quantity: number;
  details: string;
  width?: number;
  height?: number;
  unit?: string;
  googleDriveAssetLinks?: string;
}

interface OrderData {
  orderIds: string[];
  customerInfo: CustomerInfo;
  briefs: BriefData[];
  totalPrice: number;
  createdAt: string;
}

interface PaymentClientPageProps {
  orderIds: string[];
}

interface BankInfo {
  name: string;
  accountNumber: string;
  accountName: string;
  icon: string;
}

const BANK_ACCOUNTS: BankInfo[] = [
  {
    name: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'URGENT STUDIO',
    icon: '🏦'
  },
  {
    name: 'Bank Mandiri',
    accountNumber: '0987654321',
    accountName: 'URGENT STUDIO',
    icon: '🏛️'
  },
  {
    name: 'Bank BNI',
    accountNumber: '1122334455',
    accountName: 'URGENT STUDIO',
    icon: '🏢'
  }
];

export default function PaymentClientPage({ orderIds }: PaymentClientPageProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [copiedAccount, setCopiedAccount] = useState<string>('');

  useEffect((): void => {
    // Redirect if no order IDs
    if (orderIds === null || orderIds === undefined || orderIds.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data pesanan yang ditemukan",
        variant: "destructive",
      });
      router.push('/products');
    }
  }, [orderIds, router, toast]);

  const getTierLabel = (tier: 'basic' | 'standard' | 'premium'): string => {
    const labels: Record<'basic' | 'standard' | 'premium', string> = {
      basic: 'Basic',
      standard: 'Standard',
      premium: 'Premium'
    };
    return labels[tier];
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const copyToClipboard = async (text: string, accountName: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountName);
      toast({
        title: "Berhasil disalin!",
        description: `Nomor rekening ${accountName} telah disalin ke clipboard`,
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedAccount(''), 3000);
    } catch {
      toast({
        title: "Gagal menyalin",
        description: "Tidak dapat menyalin nomor rekening",
        variant: "destructive",
      });
    }
  };

  const generateOrderId = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  // Mock data for demo purposes
  useEffect((): void => {
    const loadOrderData = (): void => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const mockOrderData: OrderData = {
          orderIds: orderIds.length > 0 ? orderIds : [generateOrderId()],
          customerInfo: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+62812345678",
            company: "PT. Example Company"
          },
          briefs: [
            {
              productId: "logo-design",
              productName: "Logo Design",
              tier: "premium",
              price: 500000,
              quantity: 1,
              details: "Logo untuk perusahaan teknologi dengan konsep modern dan minimalis",
              width: 1920,
              height: 1080,
              unit: "px"
            },
            {
              productId: "business-card",
              productName: "Business Card Design",
              tier: "standard",
              price: 150000,
              quantity: 2,
              details: "Kartu nama dengan desain elegan dan profesional"
            }
          ],
          totalPrice: 800000,
          createdAt: new Date().toISOString()
        };
        
        setOrderData(mockOrderData);
        setIsLoading(false);
      }, 1500);
    };

    loadOrderData();
  }, [orderIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">💳</div>
            <CardTitle>Memuat Data Pembayaran...</CardTitle>
            <CardDescription>
              Sedang memuat informasi pembayaran Anda
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <CardTitle>Data Tidak Ditemukan</CardTitle>
            <CardDescription>
              Tidak dapat memuat data pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/products')} className="bg-[#ff7a2f] hover:bg-[#e6692a] border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Produk
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/products')}
              className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pembayaran Pesanan
            </h1>
            <p className="text-gray-600">
              Selesaikan pembayaran untuk memproses pesanan Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Status Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {paymentStatus === 'pending' && (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <Badge variant="secondary">Menunggu Pembayaran</Badge>
                    </>
                  )}
                  {paymentStatus === 'processing' && (
                    <>
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <Badge variant="default">Sedang Diverifikasi</Badge>
                    </>
                  )}
                  {paymentStatus === 'completed' && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Badge variant="default">Pembayaran Berhasil</Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Instructions */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle>Instruksi Pembayaran</CardTitle>
                <CardDescription>
                  Transfer ke salah satu rekening berikut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {BANK_ACCOUNTS.map((bank, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{bank.icon}</span>
                        <div>
                          <h4 className="font-semibold">{bank.name}</h4>
                          <p className="text-sm text-gray-600">{bank.accountName}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bank.accountNumber, bank.name)}
                        className="flex items-center gap-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                      >
                        {copiedAccount === bank.name ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedAccount === bank.name ? 'Tersalin' : 'Salin'}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">No. Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-lg">
                          {bank.accountNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle>Cara Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Transfer sesuai dengan jumlah total pembayaran</li>
                  <li>Gunakan nomor pesanan sebagai berita acara</li>
                  <li>Simpan bukti transfer</li>
                  <li>Konfirmasi pembayaran melalui WhatsApp</li>
                  <li>Tunggu verifikasi dari tim kami (maks. 1x24 jam)</li>
                </ol>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Alert className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Penting:</strong> Transfer harus sesuai dengan jumlah total pembayaran. 
                Jika ada perbedaan nominal, proses verifikasi akan tertunda.
              </AlertDescription>
            </Alert>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.briefs.map((brief, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{brief.productName}</h4>
                          <Badge variant="outline" className="mt-1">
                            {getTierLabel(brief.tier)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(brief.price * brief.quantity)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(brief.price)} x {brief.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Detail:</strong> {brief.details}</div>
                        {(brief.width !== null && brief.width !== undefined && brief.width > 0) && 
                         (brief.height !== null && brief.height !== undefined && brief.height > 0) && (
                          <div>
                            <strong>Dimensi:</strong> {brief.width} x {brief.height} {brief.unit ?? 'px'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(orderData.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Admin:</span>
                      <span>Gratis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Pembayaran:</span>
                      <span className="text-[#ff7a2f]">{formatPrice(orderData.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle>Informasi Pelanggan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium">{orderData.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{orderData.customerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telepon:</span>
                    <span className="font-medium">{orderData.customerInfo.phone}</span>
                  </div>
                  {(orderData.customerInfo.company !== null && 
                    orderData.customerInfo.company !== undefined && 
                    orderData.customerInfo.company.trim() !== '') && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Perusahaan:</span>
                      <span className="font-medium">{orderData.customerInfo.company}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order IDs */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardHeader>
                <CardTitle>ID Pesanan</CardTitle>
                <CardDescription>
                  Gunakan sebagai berita acara saat transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orderData.orderIds.map((orderId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono font-semibold">{orderId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(orderId, `Order ID ${index + 1}`)}
                        className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <CardContent className="py-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Butuh Bantuan?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Hubungi kami untuk konfirmasi pembayaran atau bantuan lainnya
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}