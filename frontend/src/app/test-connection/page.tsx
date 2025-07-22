'use client';

import { useState, useEffect } from 'react';
import backendService, { BackendOrder } from '@/services/backendService';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'failed'>('loading');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [pingResponse, setPingResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Test koneksi saat halaman dimuat
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('loading');
    setError('');

    try {
      // Test ping endpoint
      const pingResult = await backendService.ping();
      
      if (pingResult.success) {
        setPingResponse(pingResult.data);
        setConnectionStatus('connected');
        
        // Jika ping berhasil, ambil data orders
        await fetchOrders();
      } else {
        setConnectionStatus('failed');
        setError(pingResult.error || 'Unknown error');
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      setError(err.message || 'Connection failed');
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersResult = await backendService.getOrders();
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const createTestOrder = async () => {
    try {
      const testOrder = {
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        status: 'pending',
        totalAmount: 100000
      };

      const result = await backendService.createOrder(testOrder);
      if (result.success) {
        alert('Order berhasil dibuat!');
        await fetchOrders(); // Refresh orders list
      } else {
        alert('Gagal membuat order: ' + result.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔗 Test Koneksi Frontend ↔ Backend
        </h1>

        {/* Status Koneksi */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status Koneksi</h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="font-medium">
              {connectionStatus === 'connected' ? '✅ Terhubung' : 
               connectionStatus === 'failed' ? '❌ Gagal' : '⏳ Menghubungkan...'}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {pingResponse && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong>Backend Response:</strong>
              <pre className="mt-2 text-sm">{JSON.stringify(pingResponse, null, 2)}</pre>
            </div>
          )}

          <button
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            🔄 Test Ulang Koneksi
          </button>
        </div>

        {/* Data Orders */}
        {connectionStatus === 'connected' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Data Orders dari Backend</h2>
              <button
                onClick={createTestOrder}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                ➕ Buat Test Order
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="px-4 py-2 font-mono text-sm">{order.id}</td>
                        <td className="px-4 py-2">{order.customerName}</td>
                        <td className="px-4 py-2">{order.customerEmail}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data orders</p>
            )}
          </div>
        )}

        {/* Informasi Endpoint */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available API Endpoints</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">GET</span>
              <span>http://localhost:8080/api/ping</span>
            </div>
            <div className="flex">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">GET</span>
              <span>http://localhost:8080/api/orders</span>
            </div>
            <div className="flex">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">GET</span>
              <span>http://localhost:8080/api/orders/:id</span>
            </div>
            <div className="flex">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">POST</span>
              <span>http://localhost:8080/api/orders</span>
            </div>
            <div className="flex">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">PUT</span>
              <span>http://localhost:8080/api/orders/:id/status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}