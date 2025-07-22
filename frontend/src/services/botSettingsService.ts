
'use server';

// Semua fungsi bot settings dinonaktifkan karena Firestore dihapus
export interface BotSettings {
    telegramBotToken: string;
    telegramChatId: string;
    telegramWebhookSecret: string;
    templatePaymentConfirmation: string;
    notifyOnPaymentConfirmation: boolean;
    manualWebhookUrl?: string;
}
export async function getBotSettings(): Promise<BotSettings> {
  return {
    telegramBotToken: '',
    telegramChatId: '',
    telegramWebhookSecret: '',
    templatePaymentConfirmation: '',
    notifyOnPaymentConfirmation: false,
    manualWebhookUrl: '',
  };
}
export async function updateBotSettings() {
  return true;
}

    