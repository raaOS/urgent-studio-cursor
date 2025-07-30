'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrderAnalytics, useBulkOperations } from '@/hooks/use-dashboard';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Filter,
  MoreHorizontal,
  Eye
} from 'lucide-react';

interface OrderManagementProps {
  className?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: number;
  createdAt: string;
  shippingAddress: string;
}

export function OrderManagement({ className }: OrderManagementProps): JSX.Element {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { analytics, loading, error } = useOrderAnalytics();
  const { bulkUpdateOrderStatus, exportOrders } = useBulkOperations();

  // Mock orders data - in real app this would come from a separate orders API
  const orders: Order[] = analytics ? [
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      status: 'pending',
      totalAmount: 500000,
      items: 2,
      createdAt: new Date().toISOString(),
      shippingAddress: 'Jakarta, Indonesia'
    },
    {
      id: 'ORD-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      status: 'processing',
      totalAmount: 750000,
      items: 3,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      shippingAddress: 'Bandung, Indonesia'
    },
    {
      id: 'ORD-003',
      customerName: 'Bob Wilson',
      customerEmail: 'bob@example.com',
      status: 'shipped',
      totalAmount: 300000,
      items: 1,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      shippingAddress: 'Surabaya, Indonesia'
    }
  ] : [];

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string): string => {
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectOrder = (orderId: string): void => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (): void => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string): Promise<void> => {
    if (selectedOrders.length === 0) return;
    
    try {
      await bulkUpdateOrderStatus(selectedOrders, newStatus);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleExportOrders = async (): Promise<void> => {
    try {
      const filters = statusFilter === 'all' ? undefined : { status: [statusFilter] };
      await exportOrders(filters);
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  const filteredOrders = orders?.filter((order: Order) => 
    statusFilter === 'all' || order.status === statusFilter
  ) || [];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Memuat pesanan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Terjadi kesalahan saat memuat pesanan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Pesanan</CardTitle>
            <CardDescription>Kelola dan pantau semua pesanan</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportOrders}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Bulk Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedOrders.length} pesanan dipilih
              </span>
              <Select onValueChange={handleBulkStatusUpdate}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left font-medium">ID Pesanan</th>
                  <th className="p-3 text-left font-medium">Pelanggan</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Total</th>
                  <th className="p-3 text-left font-medium">Items</th>
                  <th className="p-3 text-left font-medium">Tanggal</th>
                  <th className="p-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: Order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm">#{order.id}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`flex items-center space-x-1 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{order.items} item</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter === 'all' ? 'Tidak ada pesanan' : `Tidak ada pesanan dengan status ${statusFilter}`}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Menampilkan {filteredOrders.length} pesanan
          </div>
        )}
      </CardContent>
    </Card>
  );
}