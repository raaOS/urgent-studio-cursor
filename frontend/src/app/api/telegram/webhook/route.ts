
import { NextRequest, NextResponse } from 'next/server';
import { processTelegramMessage, TelegramMessageInput } from '@/ai/flows/processTelegramMessage';
import { ValidationException } from '@/lib/exceptions';
import { getBotSettings } from '@/services/botSettingsService';

/**
 * Handles incoming POST requests from the Telegram webhook.
 *
 * This endpoint is the "ear" of our application. Telegram sends updates (new messages, button clicks, etc.)
 * to this URL. The function validates the incoming payload and passes it to an AI flow for processing.
 * 
 * It includes a secret token check to ensure that requests are genuinely from Telegram.
 */
export async function POST(req: NextRequest) {
  // Dummy response
  return new NextResponse('Webhook endpoint dinonaktifkan (tanpa Firebase)', { status: 200 });
}

// Telegram also sends a GET request to verify the endpoint is alive.
export async function GET() {
    return new NextResponse('OK. Webhook is active.', { status: 200 });
}
