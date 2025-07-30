import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface OrderStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderUpdate {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  updated_at: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: string;
  currentStatus: OrderStatus['status'];
  statusHistory: OrderStatus[];
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Type guard untuk memvalidasi OrderUpdate
function isOrderUpdate(data: unknown): data is OrderUpdate {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'status' in data &&
    'updated_at' in data &&
    typeof (data as OrderUpdate).id === 'string' &&
    typeof (data as OrderUpdate).status === 'string' &&
    typeof (data as OrderUpdate).updated_at === 'string'
  );
}

export default function RealTimeOrderTracking(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { connectionStatus } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    onMessage: (message) => {
      if (message.type === 'order_update' && isOrderUpdate(message.data)) {
        const orderUpdate = message.data;
        
        // Update order details if this is the current order
        setOrderDetails(prev => {
          if (prev && prev.id === orderUpdate.id) {
            return {
              ...prev,
              currentStatus: orderUpdate.status,
              statusHistory: [
                {
                  id: orderUpdate.id,
                  status: orderUpdate.status,
                  timestamp: orderUpdate.updated_at,
                  description: `Status diperbarui menjadi ${getStatusText(orderUpdate.status)}`,
                },
                ...prev.statusHistory,
              ],
            };
          }
          return prev;
        });
      }
    },
    onOpen: () => {
      console.log('WebSocket connected for order tracking');
    },
    onClose: () => {
      console.log('WebSocket disconnected from order tracking');
    },
  });

  const searchOrder = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setError('Masukkan nomor pesanan atau email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${query.trim()}`);
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Pesanan tidak ditemukan. Silakan periksa kembali nomor pesanan atau email Anda.');
        } else {
          setError(result.error || 'Terjadi kesalahan saat mengambil data pesanan');
        }
        setOrderDetails(null);
        return;
      }
      
      if (result.success) {
        setOrderDetails(result.data);
      } else {
        setError(result.error || 'Gagal mengambil data pesanan');
        setOrderDetails(null);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus['status']): JSX.Element => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <CheckCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus['status']): string => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionStatus = (): string => {
    switch (connectionStatus) {
      case 'connected':
        return 'Terhubung ke server';
      case 'connecting':
        return 'Menghubungkan...';
      case 'disconnected':
        return 'Terputus dari server';
      default:
        return connectionStatus;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-end space-x-2 text-sm">
        {connectionStatus === 'connected' ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : connectionStatus === 'connecting' ? (
          <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ${
          connectionStatus === 'connected' ? 'text-green-600' :
          connectionStatus === 'connecting' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {getConnectionStatus()}
        </span>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Lacak Pesanan</span>
          </CardTitle>
          <CardDescription>
            Masukkan nomor pesanan atau email untuk melacak status pesanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Masukkan nomor pesanan atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOrder(searchQuery)}
              className="flex-1"
            />
            <Button 
              onClick={() => searchOrder(searchQuery)}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Lacak
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      {orderDetails && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pesanan #{orderDetails.orderNumber}</CardTitle>
                  <Badge className={getStatusColor(orderDetails.currentStatus)}>
                    {getStatusText(orderDetails.currentStatus)}
                  </Badge>
                </div>
                <CardDescription>
                  Dibuat pada {formatDate(orderDetails.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Pelanggan:</span>
                      <span>{orderDetails.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{orderDetails.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Telepon:</span>
                      <span>{orderDetails.customerPhone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Estimasi Selesai:</span>
                      <span>{formatDate(orderDetails.estimatedDelivery)}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Alamat:</span>
                        <p className="text-gray-600 mt-1">{orderDetails.shippingAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline Status</CardTitle>
                <CardDescription>
                  Riwayat perubahan status pesanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.statusHistory.map((status, index) => (
                    <div key={status.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(status.status)}`}
                          >
                            {getStatusText(status.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(status.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">
                          {status.description}
                        </p>
                        {status.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {status.location}
                          </p>
                        )}
                      </div>
                      {index < orderDetails.statusHistory.length - 1 && (
                        <div className="absolute left-6 mt-8 w-px h-8 bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Total</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(orderDetails.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}