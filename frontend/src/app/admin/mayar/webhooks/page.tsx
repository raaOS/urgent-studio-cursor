'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Copy,
  RefreshCw,
  Zap
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  event: string;
  url: string;
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: string;
  responseTime?: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  status: 'success' | 'failed' | 'pending';
  responseCode?: number;
  responseTime?: number;
  payload: Record<string, unknown>;
  response?: string;
  error?: string;
  timestamp: string;
}

interface WebhookFormData {
  event: string;
  url: string;
  status: 'active' | 'inactive' | 'failed';
}

export default function MayarWebhooksPage(): JSX.Element {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEvent | null>(null);
  const [formData, setFormData] = useState<WebhookFormData>({
    event: '',
    url: '',
    status: 'active'
  });
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');

  // Mock data untuk demo
  useEffect(() => {
    const mockWebhooks: WebhookEvent[] = [
      {
        id: 'wh_001',
        event: 'payment.completed',
        url: 'https://myapp.com/webhooks/payment-completed',
        status: 'active',
        lastTriggered: '2024-01-25T14:30:00Z',
        responseTime: 250,
        successCount: 45,
        failureCount: 2,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-25T14:30:00Z'
      },
      {
        id: 'wh_002',
        event: 'payment.failed',
        url: 'https://myapp.com/webhooks/payment-failed',
        status: 'active',
        lastTriggered: '2024-01-24T09:15:00Z',
        responseTime: 180,
        successCount: 12,
        failureCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-24T09:15:00Z'
      },
      {
        id: 'wh_003',
        event: 'invoice.created',
        url: 'https://myapp.com/webhooks/invoice-created',
        status: 'failed',
        lastTriggered: '2024-01-23T16:45:00Z',
        responseTime: 5000,
        successCount: 28,
        failureCount: 8,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-23T16:45:00Z'
      },
      {
        id: 'wh_004',
        event: 'customer.created',
        url: 'https://myapp.com/webhooks/customer-created',
        status: 'inactive',
        successCount: 0,
        failureCount: 0,
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z'
      }
    ];

    const mockLogs: WebhookLog[] = [
      {
        id: 'log_001',
        webhookId: 'wh_001',
        event: 'payment.completed',
        url: 'https://myapp.com/webhooks/payment-completed',
        status: 'success',
        responseCode: 200,
        responseTime: 250,
        payload: {
          transactionId: 'txn_001',
          amount: 2500000,
          status: 'paid',
          customerEmail: 'ahmad.rizki@example.com'
        },
        response: 'OK',
        timestamp: '2024-01-25T14:30:00Z'
      },
      {
        id: 'log_002',
        webhookId: 'wh_003',
        event: 'invoice.created',
        url: 'https://myapp.com/webhooks/invoice-created',
        status: 'failed',
        responseCode: 500,
        responseTime: 5000,
        payload: {
          invoiceId: 'inv_003',
          customerEmail: 'budi.santoso@example.com',
          amount: 1500000
        },
        error: 'Internal Server Error',
        timestamp: '2024-01-23T16:45:00Z'
      }
    ];

    setTimeout(() => {
      setWebhooks(mockWebhooks);
      setWebhookLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredWebhooks = webhooks.filter(webhook =>
    webhook.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    webhook.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = webhookLogs.filter(log =>
    log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWebhook = (): void => {
    const newWebhook: WebhookEvent = {
      id: `wh_${Date.now()}`,
      event: formData.event,
      url: formData.url,
      status: formData.status,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWebhooks([...webhooks, newWebhook]);
    resetForm();
  };

  const handleUpdateWebhook = (): void => {
    if (!editingWebhook) return;

    const updatedWebhooks = webhooks.map(webhook =>
      webhook.id === editingWebhook.id
        ? {
            ...webhook,
            event: formData.event,
            url: formData.url,
            status: formData.status,
            updatedAt: new Date().toISOString()
          }
        : webhook
    );

    setWebhooks(updatedWebhooks);
    resetForm();
  };

  const handleDeleteWebhook = (id: string): void => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
  };

  const resetForm = (): void => {
    setFormData({
      event: '',
      url: '',
      status: 'active'
    });
    setShowCreateForm(false);
    setEditingWebhook(null);
  };

  const startEdit = (webhook: WebhookEvent): void => {
    setFormData({
      event: webhook.event,
      url: webhook.url,
      status: webhook.status
    });
    setEditingWebhook(webhook);
    setShowCreateForm(true);
  };

  const testWebhook = (webhook: WebhookEvent): void => {
    // Simulate webhook test
    console.log('Testing webhook:', webhook.id);
    alert(`Testing webhook ${webhook.event} to ${webhook.url}`);
  };

  const copyWebhookUrl = (url: string): void => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Mayar.id</h1>
            <p className="text-gray-600 mt-1">
              Kelola webhook untuk notifikasi real-time
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Webhook
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'webhooks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              Webhooks
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="h-4 w-4 inline mr-2" />
              Logs
            </button>
          </nav>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Cari ${activeTab === 'webhooks' ? 'webhook' : 'log'} berdasarkan event atau URL...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingWebhook ? 'Edit Webhook' : 'Tambah Webhook Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event
                  </label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih Event</option>
                    <option value="payment.completed">Payment Completed</option>
                    <option value="payment.failed">Payment Failed</option>
                    <option value="payment.pending">Payment Pending</option>
                    <option value="invoice.created">Invoice Created</option>
                    <option value="invoice.paid">Invoice Paid</option>
                    <option value="customer.created">Customer Created</option>
                    <option value="customer.updated">Customer Updated</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Endpoint
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourapp.com/webhook"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Batal
                </Button>
                <Button 
                  onClick={editingWebhook ? handleUpdateWebhook : handleCreateWebhook}
                  disabled={!formData.event || !formData.url}
                >
                  {editingWebhook ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content based on active tab */}
        {activeTab === 'webhooks' ? (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Webhooks</CardTitle>
              <CardDescription>
                Menampilkan {filteredWebhooks.length} dari {webhooks.length} webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWebhooks.map((webhook) => (
                  <div 
                    key={webhook.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(webhook.status)}
                            <Badge className={getStatusColor(webhook.status)}>
                              {webhook.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">#{webhook.id}</span>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-sm text-gray-500">Event</p>
                            <div className="flex items-center text-sm font-medium">
                              <Zap className="h-3 w-3 mr-1" />
                              {webhook.event}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">URL</p>
                            <div className="flex items-center text-sm font-medium">
                              <Globe className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-48">{webhook.url}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyWebhookUrl(webhook.url)}
                                className="ml-1 p-1 h-auto"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Success/Failed</p>
                            <div className="text-sm font-medium">
                              <span className="text-green-600">{webhook.successCount}</span>
                              {' / '}
                              <span className="text-red-600">{webhook.failureCount}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Last Triggered</p>
                            <div className="text-sm font-medium">
                              {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : 'Never'}
                            </div>
                          </div>
                        </div>
                        
                        {webhook.responseTime && (
                          <div className="mt-2 text-sm text-gray-500">
                            Response time: {webhook.responseTime}ms
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(webhook)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(webhook)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredWebhooks.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Webhook tidak ditemukan' : 'Belum ada webhook'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Coba ubah kata kunci pencarian Anda'
                      : 'Tambah webhook untuk menerima notifikasi real-time'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Webhook Logs</CardTitle>
              <CardDescription>
                Menampilkan {filteredLogs.length} dari {webhookLogs.length} logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">#{log.id}</span>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-sm text-gray-500">Event</p>
                            <div className="flex items-center text-sm font-medium">
                              <Zap className="h-3 w-3 mr-1" />
                              {log.event}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Response Code</p>
                            <div className="text-sm font-medium">
                              {log.responseCode || 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Response Time</p>
                            <div className="text-sm font-medium">
                              {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Timestamp</p>
                            <div className="text-sm font-medium">
                              {formatDate(log.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Error:</strong> {log.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Log tidak ditemukan' : 'Belum ada log'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Coba ubah kata kunci pencarian Anda'
                      : 'Log webhook akan muncul di sini setelah webhook dipicu'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}