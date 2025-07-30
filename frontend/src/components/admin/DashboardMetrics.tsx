'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/use-dashboard';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  RefreshCw,
  Clock
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, change, changeType, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${getChangeColor(changeType)}`}>
            {getChangeIcon(changeType)}
            <span className="ml-1">
              {change > 0 ? '+' : ''}{change}% dari bulan lalu
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  className?: string;
}

export function DashboardMetrics({ className }: DashboardMetricsProps) {
  const { metrics, loading, error, lastUpdated, refreshMetrics } = useDashboardMetrics();

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshMetrics}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header dengan refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Metrics</h2>
          <p className="text-muted-foreground">
            Overview performa bisnis real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pendapatan"
          value={loading ? '...' : `Rp ${metrics?.totalRevenue?.toLocaleString('id-ID') || '0'}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        
        <MetricCard
          title="Total Pesanan"
          value={loading ? '...' : metrics?.totalOrders || 0}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        
        <MetricCard
          title="Produk Populer"
          value={loading ? '...' : metrics?.topProducts?.length || 0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        
        <MetricCard
          title="Pelanggan Aktif"
          value={loading ? '...' : metrics?.activeCustomers || 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* Status Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">{metrics.ordersByStatus?.pending || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Processing</span>
                <Badge variant="default">{metrics.ordersByStatus?.processing || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {metrics.ordersByStatus?.completed || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cancelled</span>
                <Badge variant="destructive">{metrics.ordersByStatus?.cancelled || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Kategori Populer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.revenueByCategory && Object.entries(metrics.revenueByCategory).map(([category, revenue], index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{category}</span>
                  <Badge variant="outline">Rp {revenue.toLocaleString('id-ID')}</Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">Tidak ada data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performa Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pesanan Selesai</span>
                <Badge variant="default">{metrics.completedToday || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendapatan Hari Ini</span>
                <Badge variant="outline">
                  Rp {metrics.revenueToday?.toLocaleString('id-ID') || '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pesanan Pending</span>
                <Badge variant="secondary">
                  {metrics.pendingOrders || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}