
'use server';

import axios from 'axios';
import { InternalServerException, NotFoundException, ValidationException } from '@/lib/exceptions';
import { getBotSettings } from './botSettingsService';
import { addLog, getLogById, LogContext } from './logService';

/**
 * Replaces placeholders in a template string with actual data.
 * This is an internal helper function.
 * @param template The template string, e.g., "Hello {{name}}".
 * @param data The data object, e.g., { name: "World" }.
 * @returns The processed string.
 */
function processTemplate(template: string, data: Record<string, any>): string {
    let processedText = template;
    // Handle simple placeholders like {{customerName}}
    for (const key in data) {
        if (typeof data[key] === 'string' || typeof data[key] === 'number') {
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            processedText = processedText.replace(regex, data[key]);
        }
    }
    
    // Handle simple loops like {{#each orderIds}}...{{/each}}
    const loopRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    processedText = processedText.replace(loopRegex, (match, arrayName, innerTemplate) => {
        if (Array.isArray(data[arrayName])) {
            return data[arrayName].map((item: any) => {
                // For simple arrays of strings/numbers
                return innerTemplate.replace(/\{\{this\}\}/g, item);
            }).join('');
        }
        return '';
    });

    return processedText.trim();
}

/**
 * Sends a notification message to the admin via Telegram.
 * @param template The template string to use.
 * @param data The data to populate the template with.
 * @param context Additional context for logging. Can override the default chatId.
 */
async function sendTelegramNotification(template: string, data: Record<string, any>, context: LogContext): Promise<void> {
  const settings = await getBotSettings();
  
  const { telegramBotToken } = settings;
  // Use chatId from context if provided (for replying to users), otherwise use default from settings.
  const destinationChatId = context.chatId || settings.telegramChatId;

  if (!telegramBotToken || !destinationChatId) {
    const errorMsg = "Token Bot Telegram atau Chat ID tujuan belum diatur.";
    console.warn("Skipping notification:", errorMsg);
    // Log the failure but don't crash
    await addLog('telegram', 'failure', template, context, errorMsg);
    return;
  }
  
  if (!template) {
    throw new ValidationException("Template pesan notifikasi tidak boleh kosong.");
  }

  const message = processTemplate(template, data);
  const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  try {
    await axios.post(telegramApiUrl, {
      chat_id: destinationChatId,
      text: message,
      parse_mode: 'Markdown',
    });
    // Log success
    await addLog('telegram', 'success', message, context);
  } catch (error: any) {
    const errorMsg = error.response?.data?.description || error.message || "Unknown error";
    console.error("Failed to send Telegram notification:", errorMsg);
    // Log failure
    await addLog('telegram', 'failure', message, context, errorMsg);

    // Re-throw a user-friendly error
    throw new InternalServerException(`Gagal mengirim notifikasi: ${errorMsg}`, {
      service: 'Telegram'
    });
  }
}

/**
 * Sends a test message to the configured Telegram chat.
 */
export async function sendTestTelegramNotification(): Promise<void> {
    const settings = await getBotSettings();
    const testTemplate = "✅ Ini adalah pesan tes dari sistem Urgent Studio. Konfigurasi bot Anda dengan ID Obrolan `{{chatId}}` sudah benar!";
    const context: LogContext = {
        eventType: "Pesan Tes Keluar",
        chatId: settings.telegramChatId,
    };
    await sendTelegramNotification(testTemplate, { chatId: settings.telegramChatId }, context);
}


/**
 * Resends a previously failed notification.
 * @param logId - The ID of the failed log entry to resend.
 */
export async function resendTelegramNotification(logId: string): Promise<void> {
    if (!logId) {
        throw new ValidationException("ID Log wajib diisi untuk mengirim ulang.");
    }

    const logEntry = await getLogById('telegram', logId);

    if (!logEntry) {
        throw new NotFoundException(`Log dengan ID ${logId} tidak ditemukan.`);
    }

    if (logEntry.status === 'success') {
        throw new ValidationException("Notifikasi ini sudah berhasil terkirim sebelumnya.");
    }

    const settings = await getBotSettings();
    const { telegramBotToken } = settings;
    // For resending, use the original context's chatId if it exists, otherwise use admin chat id
    const destinationChatId = logEntry.context?.chatId || settings.telegramChatId;


    if (!telegramBotToken || !destinationChatId) {
        throw new ValidationException("Token Bot atau Chat ID tidak dikonfigurasi.");
    }

    const message = logEntry.message;
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    try {
        await axios.post(telegramApiUrl, {
            chat_id: destinationChatId,
            text: message,
            parse_mode: 'Markdown',
        });
        // Log the resend success
        await addLog('telegram', 'success', `(Kirim Ulang) ${message}`, logEntry.context);
    } catch (error: any) {
        const errorMsg = error.response?.data?.description || error.message || "Unknown error";
        console.error("Failed to resend Telegram notification:", errorMsg);
        // Log the resend failure
        await addLog('telegram', 'failure', `(Gagal Kirim Ulang) ${message}`, logEntry.context, errorMsg);
        throw new InternalServerException(`Gagal mengirim ulang notifikasi: ${errorMsg}`);
    }
}


// Re-exporting the internal function for use within the service layer.
export { sendTelegramNotification };
