
'use server';

/**
 * @fileOverview Telegram message processing flow.
 *
 * This file defines a Genkit flow to process incoming messages from the Telegram webhook.
 * It logs all incoming messages and responds to a /start command.
 *
 * @exports processTelegramMessage - A function that handles the message processing.
 * @exports TelegramMessageInput - The input type for the processTelegramMessage function.
 */

import { ai } from '@/ai/genkit';
import { addLog } from '@/services/logService';
import { z } from 'zod';
import { sendTelegramNotification } from '@/services/notificationService';

// Zod schema for a simplified Telegram message structure
const TelegramMessageInputSchema = z.object({
    message_id: z.number(),
    from: z.object({
        id: z.number(),
        is_bot: z.boolean(),
        first_name: z.string(),
        username: z.string().optional(),
    }),
    chat: z.object({
        id: z.number(),
        first_name: z.string(),
        username: z.string().optional(),
        type: z.string(),
    }),
    date: z.number(),
    text: z.string().optional(),
});

export type TelegramMessageInput = z.infer<typeof TelegramMessageInputSchema>;

export async function processTelegramMessage(input: TelegramMessageInput): Promise<void> {
  return processTelegramMessageFlow(input);
}


const processTelegramMessageFlow = ai.defineFlow(
  {
    name: 'processTelegramMessageFlow',
    inputSchema: TelegramMessageInputSchema,
    outputSchema: z.void(),
  },
  async (message) => {
    const logMessage = `Pesan diterima dari @${message.from.username || message.from.first_name}: "${message.text || '[bukan teks]'}"`;
    
    // Log all incoming messages to Firestore for monitoring
    // await addLog(
    //     'telegram', 
    //     'info', 
    //     logMessage, 
    //     { 
    //         eventType: "Pesan Diterima (Webhook)",
    //         telegramMessage: message 
    //     }
    // );

    // --- LOGIC: Respond to commands and messages ---
    if (message.text) {
        let replyMessage = '';
        let eventType = '';

        if (message.text.trim() === '/start') {
            replyMessage = `Halo ${message.from.first_name}! Bot Urgent Studio aktif dan siap menerima perintah.`;
            eventType = "Balasan /start";
        } else {
            // Default reply for any other text message
            replyMessage = `Terima kasih atas pesan Anda, "${message.text}". Tim kami akan segera merespons jika diperlukan.`;
            eventType = "Balasan Otomatis";
        }

        // Send a reply directly to the user who sent the message
        await sendTelegramNotification(
            replyMessage, 
            {}, // No dynamic data needed for this template
            {
                eventType: eventType,
                // Crucially, we override the default chatId to reply to the user.
                chatId: message.chat.id.toString(),
            }
        );
    }
  }
);
