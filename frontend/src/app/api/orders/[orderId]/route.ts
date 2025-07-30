import { NextRequest, NextResponse } from 'next/server';

interface OrderParams {
  params: Promise<{ orderId: string }>;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  estimatedCompletion: string;
  items?: OrderItem[];
}

export async function GET(
  request: NextRequest,
  { params }: OrderParams
): Promise<NextResponse> {
  try {
    const { orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Mock data berdasarkan orderId
    const mockOrders: Record<string, Order> = {
      'ORD-001': {
        id: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        status: 'completed',
        totalAmount: 1500000,
        createdAt: '2024-01-15T10:30:00Z',
        estimatedCompletion: '2024-01-22T17:00:00Z',
      },
      'ORD-002': {
        id: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        status: 'processing',
        totalAmount: 2500000,
        createdAt: '2024-01-16T09:15:00Z',
        estimatedCompletion: '2024-01-23T17:00:00Z',
      },
      'ORD-003': {
        id: 'ORD-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@example.com',
        status: 'pending',
        totalAmount: 750000,
        createdAt: '2024-01-17T14:20:00Z',
        estimatedCompletion: '2024-01-24T17:00:00Z',
      },
    };

    const order = mockOrders[orderId];
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Mock status history untuk demo
    const statusHistory = [
      {
        status: 'pending',
        timestamp: order.createdAt || new Date().toISOString(),
        description: 'Pesanan diterima dan sedang diproses',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Pesanan dikonfirmasi dan sedang disiapkan',
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        description: 'Tim desain sedang mengerjakan proyek Anda',
      },
    ];

    // Add completed status if order is completed
    if (order.status === 'completed') {
      statusHistory.push({
        status: 'completed',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'Pesanan selesai dan siap untuk diunduh',
      });
    }

    const trackingData = {
      id: order.id,
      customerName: order.customerName || 'Unknown Customer',
      customerEmail: order.customerEmail || '',
      status: order.status || 'pending',
      totalAmount: order.totalAmount || 0,
      createdAt: order.createdAt || new Date().toISOString(),
      estimatedCompletion: order.estimatedCompletion || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      statusHistory,
      items: order.items || [
        {
          id: '1',
          name: 'Logo Design',
          quantity: 1,
          price: 500000,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: trackingData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Order tracking API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order tracking data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}