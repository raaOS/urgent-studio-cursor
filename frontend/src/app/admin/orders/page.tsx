'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatusEnum } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, RefreshCw } from 'lucide-react';

export default function OrdersAdminPage(): JSX.Element {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch orders when component mounts and user is authenticated
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      fetchOrders();
    }
  }, [isLoggedIn, authLoading]);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order): void => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string): Promise<void> => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as z.infer<typeof OrderStatusEnum> } 
            : order
        )
      );
      
      // If we're updating the currently selected order, update that too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus as z.infer<typeof OrderStatusEnum>
        });
      }
      
      toast.success('Status pesanan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Gagal memperbarui status pesanan');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Tampilkan loading jika sedang memeriksa status autentikasi
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
        <Button 
          onClick={fetchOrders} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Pesanan</CardTitle>
              <CardDescription>Kelola semua pesanan pelanggan</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.values(OrderStatusEnum.Values).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Memuat data pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>{order.customerName || 'Tidak ada nama'}</TableCell>
                      <TableCell>Rp {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'Pesanan Selesai' ? 'bg-green-100 text-green-800' :
                          order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={16} className="mr-2" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Informasi Pelanggan</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Nama:</span> {selectedOrder.customerName || 'Tidak ada'}</p>
                    <p><span className="font-medium">Telepon:</span> {selectedOrder.customerPhone || 'Tidak ada'}</p>
                    <p><span className="font-medium">Telegram:</span> {selectedOrder.customerTelegram || 'Tidak ada'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Informasi Pesanan</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Tanggal:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID')}</p>
                    <p><span className="font-medium">Total:</span> Rp {selectedOrder.totalAmount.toLocaleString()}</p>
                    <p><span className="font-medium">Tier:</span> {selectedOrder.briefs[0]?.productName || 'Tidak ada'}</p>
                  </div>
                </div>
              </div>

              {/* Brief Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Brief</h3>
                {selectedOrder.briefs.length === 0 ? (
                  <p className="text-gray-500">Tidak ada brief</p>
                ) : (
                  <div className="space-y-4">
                    {selectedOrder.briefs.map((brief, index) => (
                      <div key={brief.instanceId} className="border rounded-lg p-4">
                        <h4 className="font-medium">Brief {index + 1}: {brief.productName}</h4>
                        <p className="mt-2 text-sm">{brief.briefDetails}</p>
                        {brief.googleDriveAssetLinks && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Asset Link:</p>
                            <a 
                              href={brief.googleDriveAssetLinks} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {brief.googleDriveAssetLinks}
                            </a>
                          </div>
                        )}
                        {(brief.width || brief.height) && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Dimensi:</span> {brief.width} x {brief.height} {brief.unit || ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status History */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Riwayat Status</h3>
                <div className="border rounded-lg p-4">
                  {Object.entries(selectedOrder.statusHistory).map(([status, date]) => (
                    <div key={status} className="flex justify-between py-1 border-b last:border-0">
                      <span>{status}</span>
                      <span className="text-gray-500">{new Date(date).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Perbarui Status</h3>
                <div className="flex gap-4">
                  <Select
                    disabled={isUpdating}
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrderStatusEnum.Values).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}