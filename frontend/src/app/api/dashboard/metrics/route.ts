import { NextResponse } from 'next/server';

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    
    // Try to fetch data dari backend dengan fallback
    let orders: Order[] = [];
    let users: User[] = [];
    let products: Product[] = [];
    
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch(`${backendUrl}/api/orders`, {
          headers: {
            'Authorization': 'Bearer demo-token', // Demo token
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${backendUrl}/api/users`, {
          headers: {
            'Authorization': 'Bearer demo-token',
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${backendUrl}/api/products`, {
          headers: {
            'Authorization': 'Bearer demo-token',
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (ordersRes.ok) {
        orders = await ordersRes.json();
      }
      if (usersRes.ok) {
        users = await usersRes.json();
      }
      if (productsRes.ok) {
        products = await productsRes.json();
      }
    } catch {
      console.log('Backend not available, using mock data');
    }

    // Jika tidak ada data dari backend, gunakan mock data
    if (orders.length === 0) {
      orders = [
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          totalAmount: 1500000,
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          totalAmount: 2500000,
          status: 'processing',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ORD-003',
          customerName: 'Bob Johnson',
          totalAmount: 750000,
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    if (users.length === 0) {
      users = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      ];
    }

    if (products.length === 0) {
      products = [
        { id: '1', name: 'Logo Design', price: 500000 },
        { id: '2', name: 'Website Design', price: 2000000 },
        { id: '3', name: 'Business Card', price: 250000 },
      ];
    }

    // Calculate basic metrics
    const totalRevenue = orders.reduce((sum: number, order: Order) => 
      sum + (order.totalAmount || 0), 0
    );

    const today = new Date().toISOString().split('T')[0] as string;
    const ordersToday = orders.filter((order: Order) => {
      return order.createdAt !== undefined && (order.createdAt as string).includes(today);
    }).length;

    const revenueToday = orders
      .filter((order: Order) => {
        return order.createdAt !== undefined && (order.createdAt as string).includes(today);
      })
      .reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0;

    // Recent orders
    const recentOrders = orders
      .slice(0, 5)
      .map((order: Order) => ({
        id: order.id || 'unknown',
        customerName: order.customerName || 'Unknown Customer',
        totalAmount: order.totalAmount || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt || new Date().toISOString(),
      }));

    // Top products (mock data)
    const topProducts = products.slice(0, 5).map((product: Product) => ({
      id: product.id,
      name: product.name,
      sales: Math.floor(Math.random() * 50) + 1,
      revenue: Math.floor(Math.random() * 5000000) + 100000,
    }));

    // Sales trend (last 7 days)
    const salesTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter((order: Order) => 
        order.createdAt !== undefined && (order.createdAt as string).includes(dateStr as string)
      );
      
      const dayRevenue = dayOrders.reduce((sum: number, order: Order) => 
        sum + (order.totalAmount || 0), 0
      );

      return {
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayRevenue,
      };
    });

    const metrics = {
      totalOrders: orders.length,
      totalRevenue,
      totalUsers: users.length,
      totalProducts: products.length,
      ordersToday,
      revenueToday,
      averageOrderValue,
      conversionRate,
      recentOrders,
      topProducts,
      salesTrend,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}