import { NextResponse } from 'next/server';

// Simple ping endpoint for basic connectivity check
export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const responseData = {
      status: 'ok',
      message: 'Frontend API is running',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV ?? 'development',
      version: '1.0.0'
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-response-time': `${Date.now() - startTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Ping endpoint error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Ping failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}