'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealDashboardMetrics } from '@/hooks/use-real-dashboard';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface RealDashboardMetricsProps {
  className?: string;
}

export function RealDashboardMetrics({ className }: RealDashboardMetricsProps): JSX.Element {
  const { metrics, loading, error, refetch } = useRealDashboardMetrics();

  if (loading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className || ''}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="border-red-200 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`${className || ''}`}>
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <span className="text-muted-foreground">Tidak ada data metrics</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(metrics.completedToday)} selesai hari ini
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(metrics.revenueToday)} hari ini
          </p>
        </CardContent>
      </Card>

      {/* Active Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.activeCustomers)}</div>
          <p className="text-xs text-muted-foreground">
            Pelanggan aktif
          </p>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.pendingOrders)}</div>
          <p className="text-xs text-muted-foreground">
            Menunggu diproses
          </p>
        </CardContent>
      </Card>

      {/* Orders by Status */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metrics.ordersByStatus || {}).map(([status, count]) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                <span className="capitalize">{status}</span>
                <span className="font-bold">{formatNumber(count)}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pendapatan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.revenueByCategory || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, revenue]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(revenue)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      {metrics.topProducts && metrics.topProducts.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                     <div className="text-sm font-bold">{formatNumber(product.orders)} pesanan</div>
                     <div className="text-xs text-muted-foreground">
                       {formatCurrency(product.revenue)}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {metrics.recentActivity && metrics.recentActivity.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <Card className="md:col-span-4">
        <CardContent className="flex items-center justify-center p-4">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data Real-time
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}