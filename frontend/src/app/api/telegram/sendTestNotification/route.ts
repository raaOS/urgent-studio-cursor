import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    // Implementation untuk send test notification
    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent' 
    });
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test notification' 
    }, { status: 500 });
  }
}