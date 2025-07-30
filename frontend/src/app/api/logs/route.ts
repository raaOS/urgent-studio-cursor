import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema untuk validasi log entry
const LogEntrySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string().min(1).max(1000),
  timestamp: z.string(),
  context: z.record(z.unknown()).optional(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }).optional(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const LogBatchSchema = z.array(LogEntrySchema).max(50); // Limit batch size

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate single log entry or batch
    let logs: z.infer<typeof LogEntrySchema>[];
    
    if (Array.isArray(body)) {
      const validationResult = LogBatchSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid log batch format',
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }
      logs = validationResult.data;
    } else {
      const validationResult = LogEntrySchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid log entry format',
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }
      logs = [validationResult.data];
    }

    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Process each log entry
    for (const log of logs) {
      // Add server-side metadata
      const enrichedLog = {
        ...log,
        serverTimestamp: new Date().toISOString(),
        clientIP,
        userAgent,
        source: 'frontend',
      };

      // In production, you would send this to your logging service
      // For now, we'll just log to console with structured format
      if (process.env.NODE_ENV === 'development') {
        console.log(JSON.stringify(enrichedLog, null, 2));
      } else {
        // In production, send to external logging service
        // await sendToLoggingService(enrichedLog);
        console.log(JSON.stringify(enrichedLog));
      }

      // Store critical errors for immediate attention
      if (log.level === 'error') {
        // In production, you might want to:
        // - Send to error tracking service (Sentry, Bugsnag)
        // - Store in database for analysis
        // - Send alerts to development team
        console.error('CRITICAL ERROR FROM FRONTEND:', enrichedLog);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${logs.length} log entries`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error processing logs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing logs',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check for logging endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'log-collector',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

// Optional: DELETE method to clear logs (development only)
export async function DELETE(): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  // In development, you might want to clear log files or reset counters
  console.log('Log clear requested (development mode)');
  
  return NextResponse.json({
    success: true,
    message: 'Logs cleared (development mode)',
    timestamp: new Date().toISOString(),
  });
}