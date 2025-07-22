
'use server';

/**
 * @fileOverview Design brief analysis flow.
 *
 * This file defines a Genkit flow to analyze a design brief for completeness, validity,
 * and appropriateness for the selected service tier.
 * It uses the Gemini 2.5 Pro model to validate brief details.
 *
 * @exports analyzeDesignBrief - A function that handles the design brief analysis process.
 * @exports AnalyzeDesignBriefInput - The input type for the analyzeDesignBrief function.
 * @exports AnalyzeDesignBriefOutput - The return type for the analyzeDesignBrief function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


const AnalyzeDesignBriefInputSchema = z.object({
  serviceTier: z.string().describe('The service tier selected by the user (e.g., "Budget Kaki Lima", "Budget UMKM", "Budget E-commerce").'),
  briefDetails: z.string().describe('Details of the design brief.'),
  googleDriveAssetLinks: z.string().optional().describe('Google Drive asset links for the design. This may be empty for lower tiers.'),
  dimensions: z.object({
      width: z.number(),
      height: z.number(),
      unit: z.string(),
  }).optional().describe('The specific dimensions for the design.'),
  referencedBriefs: z.array(z.object({
      id: z.string(),
      details: z.string()
  })).optional().describe('Other briefs in the same order, for context if the user references them.'),
});
export type AnalyzeDesignBriefInput = z.infer<typeof AnalyzeDesignBriefInputSchema>;

const AnalyzeDesignBriefOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the design brief is valid, complete, and appropriate for the tier.'),
  reason: z.string().describe('The reason for the brief being valid or invalid. Provide constructive feedback and suggestions if invalid.'),
});
export type AnalyzeDesignBriefOutput = z.infer<typeof AnalyzeDesignBriefOutputSchema>;

export async function analyzeDesignBrief(input: AnalyzeDesignBriefInput): Promise<AnalyzeDesignBriefOutput> {
  return analyzeDesignBriefFlow(input);
}

const analyzeDesignBriefPrompt = ai.definePrompt({
  name: 'analyzeDesignBriefPrompt',
  input: {schema: AnalyzeDesignBriefInputSchema},
  output: {schema: AnalyzeDesignBriefOutputSchema},
  model: 'googleai/gemini-2.5-pro',
  prompt: `You are a very strict Senior Project Manager at a design agency. Your task is to analyze a design brief from a client to ensure it's complete, clear, and strictly fits the service tier they paid for. You must be very firm and clear in your reasoning.

  **SERVICE TIER TO ENFORCE:**
  "{{serviceTier}}"

  **PRIMARY BRIEF TO ANALYZE:**
  - Brief Details: {{{briefDetails}}}
  {{#if dimensions}}
  - Ukuran: {{{dimensions.width}}} x {{{dimensions.height}}} {{{dimensions.unit}}}
  {{/if}}
  - Google Drive Asset Links: {{#if googleDriveAssetLinks}} {{{googleDriveAssetLinks}}} {{else}} Tidak ada {{/if}}

  {{#if referencedBriefs}}
  **CONTEXT BRIEFS (From the same order):**
  {{#each referencedBriefs}}
  - Brief ID {{id}}: {{details}}
  {{/each}}
  {{/if}}

  ---
  **STRICT VALIDATION RULES:**
  You MUST evaluate the brief against the rules for its specific tier.

  **IF TIER IS "Budget Kaki Lima":**
  - **Purpose:** ONLY for single, quick, one-off designs (e.g., 1 banner, 1 flyer, 1 IG story).
  - **REJECT IF:**
    - Asks for more than ONE concept or alternative.
    - Contains forbidden keywords: 'konsep', 'alternatif', 'kampanye', 're-branding', 'UI/UX', 'landing page', 'A/B testing', 'logo'.
    - Refers to other briefs for core instructions (e.g., "samakan dengan brief #2"). Each brief must be self-contained.
    - The request is too conceptual or strategic.

  **IF TIER IS "Budget UMKM":**
  - **Purpose:** For creating marketing materials for an EXISTING brand. Assumes the client already has a logo, color palette, and fonts.
  - **REJECT IF:**
    - Asks to create a logo from scratch, a brand guideline, or a design system.
    - Asks for more than ONE core concept or design strategy.
    - Contains forbidden project types: 'UI/UX', 'landing page', 'aplikasi', 'user research', 'A/B testing'.
    - The request is to establish a new brand identity.

  **IF TIER IS "Budget E-commerce":**
  - **Purpose:** For strategic, complex digital product design.
  - **REQUIREMENT:** The brief MUST contain at least ONE strategic keyword like 'CTA', 'user flow', 'conversion', 'UI/UX', 'A/B test', 'design system', 'prototype', or 'landing page'.
  - **REJECT IF:**
    - The brief is too simple (e.g., "buatkan saya banner diskon"). This is a waste of their budget and belongs in a lower tier.
    - The brief lacks strategic intent.

  ---
  **YOUR TASK:**
  1.  Analyze the **PRIMARY BRIEF** based on the **STRICT VALIDATION RULES** for its tier.
  2.  Determine if it is valid.
  3.  Provide a clear and direct reason for your decision. If invalid, you MUST provide a constructive suggestion on how to fix the brief or which tier to choose.

  - **If VALID:** Respond with isValid: true and reason: "Brief lengkap dan sesuai dengan paket. Siap untuk dieksekusi!".
  - **If INVALID (Example Response):** Respond with isValid: false and reason: "Brief ditolak. Permintaan Anda untuk membuat 'landing page' tidak sesuai untuk paket UMKM. Saran: Upgrade ke paket E-commerce, atau ubah permintaan menjadi aset marketing spesifik seperti 'konten Instagram'."
`,
});

const analyzeDesignBriefFlow = ai.defineFlow(
  {
    name: 'analyzeDesignBriefFlow',
    inputSchema: AnalyzeDesignBriefInputSchema,
    outputSchema: AnalyzeDesignBriefOutputSchema,
  },
  async input => {
    const {output} = await analyzeDesignBriefPrompt(input);

    if (!output) {
      throw new Error("AI analysis did not return a valid response.");
    }
    
    return output;
  }
);
