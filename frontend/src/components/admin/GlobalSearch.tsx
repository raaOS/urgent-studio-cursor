'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '@/hooks/use-dashboard';
import { Search, Loader2, Package, ShoppingCart, User, X } from 'lucide-react';

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className }: GlobalSearchProps): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { results: searchResults, loading, error, search } = useGlobalSearch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        await search(searchQuery);
        setIsSearching(false);
      }
    }, 300);
  }, [search]);

  const handleSearchChange = (value: string): void => {
    setQuery(value);
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    }
  };

  const clearSearch = (): void => {
    setQuery('');
    setIsSearching(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderSearchResults = (): JSX.Element => {
    if (!searchResults || (!searchResults.orders && !searchResults.products && !searchResults.customers)) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {query.length >= 2 ? 'Tidak ada hasil ditemukan' : 'Ketik minimal 2 karakter untuk mencari'}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Products */}
        {searchResults.products && searchResults.products.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Package className="h-4 w-4" />
              <h4 className="font-medium">Produk ({searchResults.products.length})</h4>
            </div>
            <div className="space-y-2">
              {searchResults.products.map((product: {
                id: string;
                name: string;
                category: string;
                price: number;
              }) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Lihat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {searchResults.orders && searchResults.orders.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingCart className="h-4 w-4" />
              <h4 className="font-medium">Pesanan ({searchResults.orders.length})</h4>
            </div>
            <div className="space-y-2">
              {searchResults.orders.map((order: {
                id: string;
                customerName: string;
                status: string;
                totalAmount: number;
              }) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">#{order.id}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">{order.customerName}</span>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Lihat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers */}
        {searchResults.customers && searchResults.customers.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4" />
              <h4 className="font-medium">Pelanggan ({searchResults.customers.length})</h4>
            </div>
            <div className="space-y-2">
              {searchResults.customers.map((customer: {
                id: string;
                name: string;
                email: string;
                totalOrders: number;
              }) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">{customer.email}</span>
                      <Badge variant="outline">{customer.totalOrders} pesanan</Badge>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Lihat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pencarian Global</CardTitle>
        <CardDescription>Cari produk, pesanan, atau pelanggan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari produk, pesanan, atau pelanggan..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {(isSearching || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-center py-8 text-red-600">
            Terjadi kesalahan saat mencari. Silakan coba lagi.
          </div>
        )}

        {!error && renderSearchResults()}
      </CardContent>
    </Card>
  );
}