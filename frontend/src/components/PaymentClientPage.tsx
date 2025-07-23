
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces
interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    tier: string;
    price: number;
    quantity: number;
  }>;
  briefs: Array<{
    id: string;
    details: string;
    width: number;
    height: number;
    unit: string;
    driveLink: string;
  }>;
  createdAt: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// Constants
const BANK_DETAILS: BankDetails = {
  bankName: 'Bank BCA',
  accountNumber: '1234567890',
  accountName: 'Urgent Studio'
} as const;

const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
} as const;

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', CURRENCY_FORMAT_OPTIONS).format(amount);
}

function isValidOrderData(data: unknown): data is OrderData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const order = data as Record<string, unknown>;
  return (
    typeof order.id === 'string' &&
    typeof order.totalAmount === 'number' &&
    typeof order.status === 'string' &&
    typeof order.customerInfo === 'object' &&
    order.customerInfo !== null &&
    Array.isArray(order.items) &&
    Array.isArray(order.briefs) &&
    typeof order.createdAt === 'string'
  );
}

function parseOrderFromStorage(orderId: string): OrderData | null {
  try {
    const orderData = sessionStorage.getItem(`order_${orderId}`);
    if (!orderData) {
      return null;
    }
    
    const parsedData: unknown = JSON.parse(orderData);
    return isValidOrderData(parsedData) ? parsedData : null;
  } catch (error) {
    console.error('Failed to parse order from session storage:', error);
    return null;
  }
}

function calculateTotalAmount(order: OrderData): number {
  return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Component
export default function PaymentClientPage({ params }: { params: { orderId: string } }): JSX.Element {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  
  useEffect((): void => {
    const fetchOrderData = (): void => {
      try {
        const orderData = parseOrderFromStorage(params.orderId);
        
        if (!orderData) {
          setError('Data pesanan tidak ditemukan');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);
        setError('');
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Terjadi kesalahan saat mengambil data pesanan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [params.orderId]);
  
  const handlePaymentConfirmation = (): void => {
    if (!order) {
      return;
    }
    
    // Update order status to 'payment_confirmed'
    const updatedOrder: OrderData = {
      ...order,
      status: 'payment_confirmed'
    };
    
    try {
      sessionStorage.setItem(`order_${order.id}`, JSON.stringify(updatedOrder));
      
      // Clear cart after payment confirmation
      sessionStorage.removeItem('globalCart');
      sessionStorage.removeItem('globalBriefs');
      
      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to success page
      void router.push(`/payment/${order.id}/success`);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Terjadi kesalahan saat mengkonfirmasi pembayaran');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Memuat data pesanan...</div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'Data pesanan tidak ditemukan'}</p>
            <Button 
              onClick={(): void => void router.push('/')} 
              className="mt-4 w-full"
            >
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalAmount = calculateTotalAmount(order);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Instruksi Pembayaran</CardTitle>
          <CardDescription>
            Pesanan ID: {order.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Detail Bank</h3>
            <div className="space-y-1 text-blue-800">
              <p><strong>Bank:</strong> {BANK_DETAILS.bankName}</p>
              <p><strong>No. Rekening:</strong> {BANK_DETAILS.accountNumber}</p>
              <p><strong>Atas Nama:</strong> {BANK_DETAILS.accountName}</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Total Pembayaran</h3>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Informasi Penting</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
              <li>Transfer sesuai dengan nominal yang tertera</li>
              <li>Simpan bukti transfer untuk konfirmasi</li>
              <li>Setelah transfer, klik tombol konfirmasi di bawah</li>
              <li>Tim kami akan memverifikasi pembayaran dalam 1x24 jam</li>
            </ul>
          </div>
          
          <Button 
            onClick={handlePaymentConfirmation}
            className="w-full bg-[#ff7a2f] hover:bg-[#e66a2a] text-white"
            size="lg"
          >
            Konfirmasi Pembayaran
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
