'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';
import { BackendOrder, backendService } from '@/services/backendService';
import { useAuth } from '@/hooks/use-auth';
import { RealDashboardMetrics } from '@/components/admin/RealDashboardMetrics';
import { OrderAnalytics } from '@/components/admin/OrderAnalytics';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { OrderManagement } from '@/components/admin/OrderManagement';

export default function AdminDashboard(): JSX.Element {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hanya fetch data jika sudah terautentikasi
    if (isLoggedIn && !authLoading) {
      const fetchData = async (): Promise<void> => {
        try {
          setLoading(true);
          const [productsData, ordersData] = await Promise.all([
            productService.getAllProducts(),
            backendService.getOrders(),
          ]);
          setProducts(productsData);
          if (ordersData.data) {
            setOrders(ordersData.data);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isLoggedIn, authLoading]);

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

  // Get popular products
  const popularProducts = products.filter(product => product.popular);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang di dashboard admin Urgent Studio
        </p>
      </div>

      {/* Real-time Dashboard Metrics */}
      <RealDashboardMetrics />

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analytics and Search */}
        <div className="lg:col-span-2 space-y-6">
          <OrderAnalytics />
          <OrderManagement />
        </div>
        
        {/* Right Column - Activity and Search */}
        <div className="space-y-6">
          <GlobalSearch />
          <ActivityFeed />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center py-4">No orders found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{order.id}</td>
                          <td className="py-3 px-4">{order.customerName}</td>
                          <td className="py-3 px-4">Rp {order.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Products</CardTitle>
              <CardDescription>Products marked as popular</CardDescription>
            </CardHeader>
            <CardContent>
              {popularProducts.length === 0 ? (
                <p className="text-center py-4">No popular products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularProducts.slice(0, 6).map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      {product.imageUrl && (
                        <div className="h-40 overflow-hidden">
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            width={300}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                        <p className="font-medium mt-2">Rp {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}