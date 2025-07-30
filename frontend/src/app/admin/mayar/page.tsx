'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  FileText, 
  Users, 
  TrendingUp,
  Settings,
  Webhook,
  Package,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function MayarAdminPage(): JSX.Element {
  const quickActions = [
    {
      title: 'Kelola Produk',
      description: 'Tambah dan kelola produk Mayar.id',
      icon: <Package className="h-5 w-5" />,
      href: '/admin/mayar/products',
      color: 'bg-blue-500',
      count: '12 Produk'
    },
    {
      title: 'Invoice Management',
      description: 'Kelola invoice dan pembayaran',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/mayar/invoices',
      color: 'bg-green-500',
      count: '45 Invoice'
    },
    {
      title: 'Payment Requests',
      description: 'Monitor payment requests',
      icon: <CreditCard className="h-5 w-5" />,
      href: '/admin/mayar/payment-requests',
      color: 'bg-purple-500',
      count: '23 Requests'
    },
    {
      title: 'Customers',
      description: 'Kelola data pelanggan',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/mayar/customers',
      color: 'bg-orange-500',
      count: '156 Customers'
    },
    {
      title: 'Transactions',
      description: 'Monitor semua transaksi',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/admin/mayar/transactions',
      color: 'bg-indigo-500',
      count: '89 Transaksi'
    },
    {
      title: 'Webhook Settings',
      description: 'Konfigurasi webhook notifications',
      icon: <Webhook className="h-5 w-5" />,
      href: '/admin/mayar/webhooks',
      color: 'bg-red-500',
      count: '3 Active'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'payment',
      message: 'Payment berhasil untuk Invoice #INV-001',
      time: '5 menit yang lalu',
      status: 'success',
      amount: 'Rp 500.000'
    },
    {
      id: 2,
      type: 'invoice',
      message: 'Invoice baru dibuat untuk John Doe',
      time: '15 menit yang lalu',
      status: 'info',
      amount: 'Rp 750.000'
    },
    {
      id: 3,
      type: 'webhook',
      message: 'Webhook notification diterima',
      time: '30 menit yang lalu',
      status: 'info',
      amount: null
    },
    {
      id: 4,
      type: 'customer',
      message: 'Customer baru terdaftar: Jane Smith',
      time: '1 jam yang lalu',
      status: 'new',
      amount: null
    }
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: 'Rp 45.2M',
      change: '+12.5%',
      changeType: 'positive',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Active Invoices',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: 'Pending Payments',
      value: '8',
      change: '-2',
      changeType: 'negative',
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+1.2%',
      changeType: 'positive',
      icon: <TrendingUp className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeColor = (type: string): string => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mayar.id Management</h1>
            <p className="text-gray-600 mt-1">
              Kelola semua fitur Mayar.id dari satu dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Monitor
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              API Settings
            </Button>
            <Button size="sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                  {stat.change} dari bulan lalu
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Fitur Mayar.id</CardTitle>
                <CardDescription>
                  Akses cepat ke semua fitur manajemen Mayar.id
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className={`p-3 rounded-lg ${action.color} text-white mr-4 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {action.count}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Update terbaru dari Mayar.id
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                          {activity.amount && (
                            <p className="text-xs font-medium text-green-600">
                              {activity.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Lihat Semua Aktivitas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Status & Configuration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
              <CardDescription>
                Status koneksi dan konfigurasi API Mayar.id
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment:</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Sandbox
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rate Limit:</span>
                <span className="text-sm text-gray-600">45/100 requests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Aksi cepat untuk testing dan konfigurasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Test Create Product
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Test Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Test Payment Request
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Webhook className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}