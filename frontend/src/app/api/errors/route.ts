import { NextRequest, NextResponse } from 'next/server';

interface ErrorData {
  type: string;
  timestamp: string;
  message?: string;
  stack?: string;
  url?: string;
  userAgent?: string;
}

interface LogEntry extends ErrorData {
  serverTimestamp: string;
  ip: string;
  headers: {
    userAgent: string | null;
    referer: string | null;
  };
}

// Error logging endpoint for production monitoring
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const errorData: unknown = await request.json();
    
    // Type guard untuk validasi error data
    if (!isValidErrorData(errorData)) {
      return NextResponse.json(
        { error: 'Invalid error data format' },
        { status: 400 }
      );
    }
    
    // Log error with timestamp
    const logEntry: LogEntry = {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') ?? 
          request.headers.get('x-real-ip') ?? 
          'unknown',
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
    };
    
    // Log to console (in production, you'd send to monitoring service)
    console.error('Frontend Error:', JSON.stringify(logEntry, null, 2));
    
    // In production, send to monitoring service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: await sendToSentry(logEntry);
      // Example: await sendToLogRocket(logEntry);
    }
    
    return NextResponse.json({ 
      status: 'logged',
      timestamp: logEntry.serverTimestamp 
    });
    
  } catch (error: unknown) {
    console.error('Error logging endpoint failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

function isValidErrorData(data: unknown): data is ErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'timestamp' in data &&
    typeof (data as Record<string, unknown>).type === 'string' &&
    typeof (data as Record<string, unknown>).timestamp === 'string'
  );
}