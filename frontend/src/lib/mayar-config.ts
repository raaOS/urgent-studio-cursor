/**
 * Environment Configuration for Mayar.id Integration
 * 
 * This file provides type-safe access to environment variables
 * for both client-side and server-side code.
 * 
 * Official Mayar.id API URLs:
 * - Production: https://api.mayar.id/hl/v1
 * - Sandbox: https://api.mayar.club/hl/v1
 */

interface MayarConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
  webhookToken: string;
  environment: 'production' | 'sandbox';
  sandboxUrl: string;
}

interface PublicMayarConfig {
  environment: 'production' | 'sandbox';
  baseUrl: string;
}

/**
 * Official Mayar.id API URLs
 */
export const MAYAR_API_URLS = {
  production: 'https://api.mayar.id/hl/v1',
  sandbox: 'https://api.mayar.club/hl/v1',
} as const;

/**
 * Server-side Mayar configuration (includes sensitive data)
 * Only use this in API routes or server-side code
 */
export const mayarConfig: MayarConfig = {
  apiKey: process.env.MAYAR_API_KEY || '',
  webhookSecret: process.env.MAYAR_WEBHOOK_SECRET || '',
  baseUrl: process.env.MAYAR_BASE_URL || MAYAR_API_URLS.production,
  webhookToken: process.env.MAYAR_WEBHOOK_TOKEN || '',
  environment: (process.env.MAYAR_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
  sandboxUrl: process.env.MAYAR_SANDBOX_URL || MAYAR_API_URLS.sandbox,
};

/**
 * Client-side Mayar configuration (public data only)
 * Safe to use in React components
 */
export const publicMayarConfig: PublicMayarConfig = {
  environment: (process.env.NEXT_PUBLIC_MAYAR_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
  baseUrl: process.env.NEXT_PUBLIC_MAYAR_BASE_URL || MAYAR_API_URLS.production,
};

/**
 * Get the appropriate base URL based on environment
 */
export function getMayarBaseUrl(): string {
  return mayarConfig.environment === 'production' 
    ? mayarConfig.baseUrl 
    : mayarConfig.sandboxUrl;
}

/**
 * Get public base URL for client-side usage
 */
export function getPublicMayarBaseUrl(): string {
  return publicMayarConfig.baseUrl;
}

/**
 * Validate that all required environment variables are set
 */
export function validateMayarConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    { key: 'MAYAR_API_KEY', value: mayarConfig.apiKey },
    { key: 'MAYAR_WEBHOOK_SECRET', value: mayarConfig.webhookSecret },
    { key: 'MAYAR_BASE_URL', value: mayarConfig.baseUrl },
    { key: 'MAYAR_WEBHOOK_TOKEN', value: mayarConfig.webhookToken },
  ];

  const missingVars = requiredVars
    .filter(({ value }) => !value || value.trim() === '')
    .map(({ key }) => key);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Common headers for Mayar API requests
 */
export function getMayarHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${mayarConfig.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Rate limit configuration for Mayar API
 */
export const MAYAR_RATE_LIMIT = {
  requestsPerMinute: 20,
  windowMs: 60 * 1000, // 1 minute
} as const;

export default mayarConfig;