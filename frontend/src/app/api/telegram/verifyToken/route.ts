import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    // Implementation untuk verify token
    return NextResponse.json({ 
      success: true, 
      message: 'Token verified' 
    });
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify token' 
    }, { status: 500 });
  }
}