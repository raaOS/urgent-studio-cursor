import { resendTelegramNotification } from "@/services/notificationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { logId } = await request.json();
    if (!logId) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }
    await resendTelegramNotification(logId);
    return NextResponse.json({ message: `Notification ${logId} resent successfully` }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to resend notification:`, error);
    return NextResponse.json({ error: error.message || "Failed to resend notification" }, { status: 500 });
  }
}
