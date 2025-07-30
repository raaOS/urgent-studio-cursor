'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderAnalytics } from '@/hooks/use-dashboard';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';

interface OrderAnalyticsProps {
  className?: string;
}

export function OrderAnalytics({ className }: OrderAnalyticsProps): JSX.Element {
  const { analytics, loading, error } = useOrderAnalytics({});

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analitik Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analitik Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gagal memuat data analitik</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai Pesanan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Konversi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -2% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Pesanan</CardTitle>
          <CardDescription>Perkembangan pesanan dalam 3 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analytics.orderTrends || []).map((trend: { month: string; orders: number; revenue: number }) => (
              <div key={trend.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{trend.month}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{trend.orders} pesanan</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(trend.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(trend.orders / 60) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status Pesanan</CardTitle>
          <CardDescription>Breakdown pesanan berdasarkan status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.statusDistribution || {}).map(([status, count]) => {
              const getStatusColor = (status: string): string => {
                switch (status) {
                  case 'pending':
                    return 'bg-yellow-100 text-yellow-800';
                  case 'processing':
                    return 'bg-blue-100 text-blue-800';
                  case 'completed':
                    return 'bg-green-100 text-green-800';
                  case 'cancelled':
                    return 'bg-red-100 text-red-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };

              const getStatusLabel = (status: string): string => {
                switch (status) {
                  case 'pending':
                    return 'Menunggu';
                  case 'processing':
                    return 'Diproses';
                  case 'completed':
                    return 'Selesai';
                  case 'cancelled':
                    return 'Dibatalkan';
                  default:
                    return status;
                }
              };

              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold mb-1">{count as number}</div>
                  <Badge className={getStatusColor(status)}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}