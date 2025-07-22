import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// .env.local will be loaded automatically by Next.js for local dev,
// and by the updated next.config.js for production builds.

/**
 * @fileOverview Central Genkit Configuration.
 * This file initializes and exports the configured Genkit 'ai' instance.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
});
