import { verifyTelegramToken } from "@/services/botSettingsService";
import { NextResponse } from "next/server";
import { InternalServerException, ValidationException } from "@/lib/exceptions";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    const botInfo = await verifyTelegramToken(token);
    return NextResponse.json(botInfo, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to verify Telegram token:`, error);
    
    let message = "Failed to verify token";
    let status = 500;

    if (error instanceof ValidationException || error instanceof InternalServerException) {
      message = error.message;
      status = error.statusCode;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
