'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Eye,
  Download,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Transaction, PaymentMethod } from '@/types/mayar';

interface MayarTransactionData {
  id: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  payment_method?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  customerName?: string;
  customerEmail?: string;
  description?: string;
  notes?: string;
  paidAt?: string | null;
  paid_at?: string | null;
  createdAt?: string;
  created_at?: string;
  created?: string;
  updatedAt?: string;
  updated_at?: string;
  updated?: string;
}

interface MayarApiResponse {
  data?: MayarTransactionData[];
}

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
}

export default function MayarTransactionsPage(): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0
  });

  // Fetch real data from mayar.id API
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mayar/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data: MayarApiResponse = await response.json();
      
      // Map mayar transaction data to our Transaction type
      const mappedTransactions: Transaction[] = data.data?.map((txn: MayarTransactionData) => {
        const transaction: Transaction = {
          id: txn.id,
          amount: txn.amount || 0,
          status: (txn.status as Transaction['status']) || 'pending',
          customerName: txn.customer?.name || txn.customerName || 'Unknown Customer',
          customerEmail: txn.customer?.email || txn.customerEmail || '',
          description: txn.description || txn.notes || 'No description',
          createdAt: txn.createdAt || txn.created_at || txn.created || new Date().toISOString(),
          updatedAt: txn.updatedAt || txn.updated_at || txn.updated || new Date().toISOString()
        };

        // Only add optional properties if they have values
        const paymentMethod = (txn.paymentMethod || txn.payment_method) as PaymentMethod;
        if (paymentMethod) {
          transaction.paymentMethod = paymentMethod;
        }

        const paidAt = txn.paidAt || txn.paid_at;
        if (paidAt) {
          transaction.paidAt = paidAt;
        }

        return transaction;
      }) || [];

      setTransactions(mappedTransactions);
      
      // Calculate stats
      const totalAmount = mappedTransactions.reduce((sum, txn) => sum + txn.amount, 0);
      const successfulTransactions = mappedTransactions.filter(txn => txn.status === 'paid').length;
      const failedTransactions = mappedTransactions.filter(txn => txn.status === 'failed').length;
      const pendingTransactions = mappedTransactions.filter(txn => txn.status === 'pending').length;

      setStats({
        totalTransactions: mappedTransactions.length,
        totalAmount,
        successfulTransactions,
        failedTransactions,
        pendingTransactions
      });
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to empty array if API fails
      setTransactions([]);
      setStats({
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Transaction['status']): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: Transaction['status']): string => {
    switch (status) {
      case 'paid': return 'Berhasil';
      case 'pending': return 'Menunggu';
      case 'failed': return 'Gagal';
      case 'cancelled': return 'Dibatalkan';
      case 'expired': return 'Kedaluwarsa';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: Transaction['status']): React.ReactNode => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodText = (method: string | undefined): string => {
    if (!method) return 'Tidak Diketahui';
    
    switch (method) {
      case 'bank_transfer': return 'Transfer Bank';
      case 'credit_card': return 'Kartu Kredit';
      case 'e_wallet': return 'E-Wallet';
      case 'qr_code': return 'QR Code';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Transaksi Mayar.id</h1>
            <p className="text-gray-600 mt-1">
              Monitor dan kelola semua transaksi pembayaran
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Berhasil</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successfulTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gagal/Pending</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failedTransactions + stats.pendingTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari transaksi berdasarkan ID, nama pelanggan, email, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Berhasil</option>
                <option value="pending">Menunggu</option>
                <option value="failed">Gagal</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter Lanjutan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>
              Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">#{transaction.id}</span>
                      </div>
                      
                      <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-gray-500">Pelanggan</p>
                          <div className="flex items-center text-sm font-medium">
                            <User className="h-3 w-3 mr-1" />
                            {transaction.customerName}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {transaction.customerEmail}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Deskripsi</p>
                          <p className="text-sm font-medium line-clamp-2">
                            {transaction.description}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Metode Pembayaran</p>
                          <div className="flex items-center text-sm font-medium">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {getPaymentMethodText(transaction.paymentMethod)}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Waktu</p>
                          <div className="flex items-center text-sm font-medium">
                            <Calendar className="h-3 w-3 mr-1" />
                            {transaction.paidAt ? formatDate(transaction.paidAt) : formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(transaction.amount)}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Coba ubah kata kunci pencarian atau filter Anda'
                    : 'Transaksi akan muncul di sini setelah pelanggan melakukan pembayaran'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}