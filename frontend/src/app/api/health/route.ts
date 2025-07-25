import { NextResponse } from 'next/server';

interface HealthCheckResult {
  status: 'ok' | 'error';
  responseTime?: string;
  message: string;
}

interface ExternalServicesResult {
  status: 'ok' | 'error';
  services: Record<string, string>;
  message: string;
}

// Health check endpoint for production monitoring
export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbCheck = await checkDatabase();
    
    // Check external services (optional)
    const servicesCheck = await checkExternalServices();
    
    // System metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: Date.now() - startTime,
      version: process.env.npm_package_version ?? '1.0.0',
      environment : process.env.NODE_ENV ?? 'development'
    };

    // Overall health status
    const isHealthy = dbCheck.status === 'ok' && servicesCheck.status === 'ok';
    
    const healthData = {
      status: Boolean(isHealthy) ? 'ok'  : 'error',
      timestamp: metrics.timestamp,
      services: {
        database: dbCheck,
        external: servicesCheck
      },
      metrics,
      checks: {
        database: dbCheck.status === 'ok',
        memory: metrics.memory.heapUsed < 500 * 1024 * 1024, // 500MB threshold
        responseTime: metrics.responseTime < 1000 // 1 second threshold
      }
    };

    return NextResponse.json(healthData, { 
      status: Boolean(isHealthy) ? 200  : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message  : 'Unknown error',
      metrics: {
        responseTime: Date.now() - startTime
      }
    }, { status: 503 });
  }
}

// Check database connectivity
async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Simple database ping - adjust based on your database setup
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ping`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (Boolean(response.ok)) {
      return {
        status: 'ok',
        responseTime: response.headers.get('x-response-time') ?? 'unknown',
        message: 'Database connection successful'
      };
    } else {
      return {
        status: 'error',
        message: `Database check failed with status: ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message  : 'Database connection failed'
    };
  }
}

// Check external services (AI, Payment, etc.)
async function checkExternalServices(): Promise<ExternalServicesResult> {
  const services = {
    ai: process.env.GOOGLE_API_KEY ? 'enabled'  : 'disabled',
    payment: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'enabled'  : 'disabled',
    telegram: process.env.TELEGRAM_BOT_TOKEN ? 'enabled'  : 'disabled'
  };

  // Since these are optional, we always return ok
  return {
    status: 'ok',
    services,
    message: 'External services check completed'
  };
}