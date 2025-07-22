import { sendTestTelegramNotification } from "@/services/notificationService";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await sendTestTelegramNotification();
    return NextResponse.json({ message: "Test notification sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to send test Telegram notification:", error);
    return NextResponse.json({ error: error.message || "Failed to send test notification" }, { status: 500 });
  }
}
