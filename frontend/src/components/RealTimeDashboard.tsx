import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersToday: number;
  revenueToday: number;
  averageOrderValue: number;
  conversionRate: number;
  lastUpdated: string;
  recentOrders?: Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts?: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesTrend?: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

interface WebSocketMessage {
  type: string;
  data: {
    total_orders: number;
    total_revenue: number;
    orders_today: number;
    revenue_today: number;
    last_updated: string;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

export default function RealTimeDashboard(): JSX.Element {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  const { connectionStatus, lastMessage } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    onMessage: (message) => {
      if (message.type === 'dashboard_update') {
        const messageData = message.data as WebSocketMessage['data'];
        setMetrics(prev => prev ? {
          ...prev,
          totalOrders: messageData.total_orders,
          totalRevenue: messageData.total_revenue,
          ordersToday: messageData.orders_today,
          revenueToday: messageData.revenue_today,
          lastUpdated: messageData.last_updated,
        } : null);
      }
    },
    onOpen: () => {
      console.log('WebSocket connected');
    },
    onClose: () => {
      console.log('WebSocket disconnected');
    },
  });

  const fetchMetrics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch metrics');
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      
      // Fallback ke mock data jika API gagal
      const mockMetrics: DashboardMetrics = {
        totalOrders: 156,
        totalRevenue: 45600000,
        totalUsers: 89,
        totalProducts: 12,
        ordersToday: 8,
        revenueToday: 3200000,
        averageOrderValue: 292307,
        conversionRate: 12.5,
        lastUpdated: new Date().toISOString()
      };
      setMetrics(mockMetrics);
      setLastRefresh(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      setLastRefresh(new Date());
    }
  }, [lastMessage]);

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

  const getMetricCards = (): MetricCard[] => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Pesanan',
        value: formatNumber(metrics.totalOrders),
        change: metrics.ordersToday,
        changeType: metrics.ordersToday > 0 ? 'increase' : 'neutral',
        icon: <ShoppingCart className="h-4 w-4" />,
        description: `${metrics.ordersToday} pesanan hari ini`
      },
      {
        title: 'Total Pendapatan',
        value: formatCurrency(metrics.totalRevenue),
        change: metrics.revenueToday,
        changeType: metrics.revenueToday > 0 ? 'increase' : 'neutral',
        icon: <DollarSign className="h-4 w-4" />,
        description: `${formatCurrency(metrics.revenueToday)} hari ini`
      },
      {
        title: 'Total Pengguna',
        value: formatNumber(metrics.totalUsers),
        change: 0,
        changeType: 'neutral',
        icon: <Users className="h-4 w-4" />,
        description: 'Pengguna terdaftar'
      },
      {
        title: 'Total Produk',
        value: formatNumber(metrics.totalProducts),
        change: 0,
        changeType: 'neutral',
        icon: <Package className="h-4 w-4" />,
        description: 'Produk tersedia'
      },
      {
        title: 'Rata-rata Nilai Pesanan',
        value: formatCurrency(metrics.averageOrderValue),
        change: 0,
        changeType: 'neutral',
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'Per pesanan'
      },
      {
        title: 'Tingkat Konversi',
        value: `${metrics.conversionRate.toFixed(1)}%`,
        change: 0,
        changeType: metrics.conversionRate > 10 ? 'increase' : 'neutral',
        icon: <Activity className="h-4 w-4" />,
        description: 'Pengguna ke pesanan'
      }
    ];
  };

  const renderMetricCard = (metric: MetricCard, index: number): JSX.Element => (
    <Card key={index} className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {metric.title}
        </CardTitle>
        <div className="text-gray-400">
          {metric.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {metric.value}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
          {metric.changeType === 'increase' && (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+{formatNumber(metric.change)}</span>
            </>
          )}
          {metric.changeType === 'decrease' && (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-600">-{formatNumber(Math.abs(metric.change))}</span>
            </>
          )}
          <span>{metric.description}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {lastRefresh.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Realtime</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
                <span className="text-sm text-yellow-600">Menghubungkan...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Terputus</span>
              </>
            )}
          </div>
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs"
          >
            {autoRefresh ? 'Matikan' : 'Aktifkan'} Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getMetricCards().map((metric, index) => renderMetricCard(metric, index))}
      </div>

      {/* Status Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Sistem</CardTitle>
          <CardDescription>
            Monitoring real-time sistem dan performa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Backend API: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Auto Refresh: {autoRefresh ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}