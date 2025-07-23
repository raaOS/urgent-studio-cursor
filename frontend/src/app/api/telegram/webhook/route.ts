import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    // Implementation untuk webhook
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed' 
    });
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process webhook' 
    }, { status: 500 });
  }
}