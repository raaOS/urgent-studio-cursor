'use client';

import React from 'react';
import RealTimeDashboard from '@/components/RealTimeDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Settings,
  Bell,
  Download,
  Calendar
} from 'lucide-react';

export default function AdminDashboardPage(): JSX.Element {
  const quickActions = [
    {
      title: 'Kelola Pesanan',
      description: 'Lihat dan kelola pesanan terbaru',
      icon: <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />,
      href: '/admin/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'Kelola Pengguna',
      description: 'Manajemen pengguna dan akses',
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      href: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Kelola Produk',
      description: 'Tambah dan edit produk',
      icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
      href: '/admin/products',
      color: 'bg-purple-500'
    },
    {
      title: 'Pengaturan',
      description: 'Konfigurasi sistem',
      icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'Pesanan baru dari John Doe',
      time: '5 menit yang lalu',
      status: 'new'
    },
    {
      id: 2,
      type: 'user',
      message: 'Pengguna baru mendaftar: Jane Smith',
      time: '15 menit yang lalu',
      status: 'info'
    },
    {
      id: 3,
      type: 'product',
      message: 'Stok produk "Logo Design" hampir habis',
      time: '1 jam yang lalu',
      status: 'warning'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Pembayaran berhasil untuk pesanan #12345',
      time: '2 jam yang lalu',
      status: 'success'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Selamat datang kembali! Berikut ringkasan aktivitas hari ini.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Laporan Bulanan
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" className="text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Notifikasi
            </Button>
          </div>
        </div>

        {/* Real-time Dashboard */}
        <RealTimeDashboard />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Akses cepat ke fitur administrasi utama
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className={`p-2 sm:p-3 rounded-lg ${action.color} text-white mr-3 sm:mr-4 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
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
                  Update terbaru dari sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
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

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>
              Monitoring kesehatan sistem dan performa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">API Server</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-500">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Cache</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Storage</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}