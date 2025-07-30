'use client';

import React from 'react';
import MayarIntegration from '@/components/MayarIntegration';

const MayarDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Demo Mayar.id Payment Gateway
              </h1>
              <p className="mt-2 text-gray-600">
                Test and explore Mayar.id payment integration features
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🟢 Connected
              </span>
              <span className="text-sm text-gray-500">
                Environment: {process.env.NEXT_PUBLIC_MAYAR_ENVIRONMENT || 'sandbox'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <p className="text-sm text-gray-500">Browse and select products from Mayar.id</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-semibold">📄</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                <p className="text-sm text-gray-500">Create and manage invoices</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">💳</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Payments</h3>
                <p className="text-sm text-gray-500">Process payment requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Component */}
        <MayarIntegration className="mb-8" />

        {/* API Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_MAYAR_BASE_URL || 'https://api.mayar.id/hl/v1'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_MAYAR_ENVIRONMENT || 'sandbox'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Available Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Browse and filter products by type</li>
              <li>• Create invoices with customer details</li>
              <li>• Generate payment requests</li>
              <li>• View recent activity and status</li>
              <li>• Real-time API integration</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Demo Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This is a demo environment using sandbox API</li>
              <li>• No real payments will be processed</li>
              <li>• API responses may be simulated</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MayarDemoPage;