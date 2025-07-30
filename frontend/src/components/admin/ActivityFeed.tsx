'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivityFeed } from '@/hooks/use-dashboard';
import { Loader2, Clock, ShoppingCart, Package, User, Settings } from 'lucide-react';

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

export function ActivityFeed({ className, limit = 10 }: ActivityFeedProps): JSX.Element {
  const { activities, loading, error } = useActivityFeed(limit);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Aktivitas sistem dalam waktu real-time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !activities || !Array.isArray(activities)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Aktivitas sistem dalam waktu real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gagal memuat aktivitas</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'order_created':
        return <ShoppingCart className="h-4 w-4" />;
      case 'order_updated':
        return <Package className="h-4 w-4" />;
      case 'product_updated':
        return <Settings className="h-4 w-4" />;
      case 'user_registered':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'order_created':
        return 'bg-green-100 text-green-800';
      case 'order_updated':
        return 'bg-blue-100 text-blue-800';
      case 'product_updated':
        return 'bg-purple-100 text-purple-800';
      case 'user_registered':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari yang lalu`;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>Aktivitas sistem dalam waktu real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada aktivitas terbaru
            </p>
          ) : (
            activities.map((activity: {
              id: string;
              type: string;
              message: string;
              timestamp: string;
            }) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Lihat semua aktivitas
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}