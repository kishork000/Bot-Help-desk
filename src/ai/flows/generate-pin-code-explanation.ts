'use server';
/**
 * @fileOverview Generates an explanation of a PIN code's significance based on village information.
 *
 * - generatePinCodeExplanation - A function that generates the PIN code explanation.
 * - GeneratePinCodeExplanationInput - The input type for the generatePinCodeExplanation function.
 * - GeneratePinCodeExplanationOutput - The return type for the generatePinCodeExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePinCodeExplanationInputSchema = z.object({
  pinCode: z.string().describe('The PIN code to explain.'),
  villageInformation: z
    .string()
    .describe('Information about the village associated with the PIN code.'),
});
export type GeneratePinCodeExplanationInput = z.infer<typeof GeneratePinCodeExplanationInputSchema>;

const GeneratePinCodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the PIN code significance.'),
});
export type GeneratePinCodeExplanationOutput = z.infer<typeof GeneratePinCodeExplanationOutputSchema>;

export async function generatePinCodeExplanation(
  input: GeneratePinCodeExplanationInput
): Promise<GeneratePinCodeExplanationOutput> {
  return generatePinCodeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePinCodeExplanationPrompt',
  input: {schema: GeneratePinCodeExplanationInputSchema},
  output: {schema: GeneratePinCodeExplanationOutputSchema},
  prompt: `You are an expert in local Indian geography and history. You will use your knowledge to explain the significance of a PIN code.
  
  {{#if villageInformation}}
  Use the provided village information as the primary source for your explanation.
  Village Information: {{{villageInformation}}}
  {{else}}
  No local information was provided. Use your own knowledge to find and explain the significance of the provided PIN code.
  {{/if}}

  PIN code: {{{pinCode}}}

  Explain the significance of the provided PIN code. Focus on historical, cultural, and geographical aspects. The explanation should be concise and easy for a user to understand.`,
});

const generatePinCodeExplanationFlow = ai.defineFlow(
  {
    name: 'generatePinCodeExplanationFlow',
    inputSchema: GeneratePinCodeExplanationInputSchema,
    outputSchema: GeneratePinCodeExplanationOutputSchema,
  },
  async input => {
    // A little trick: if we pass 'No local information available.', we should clear it
    // so the handlebars template can use the {{#if villageInformation}} block correctly.
    if (input.villageInformation === 'No local information available.') {
      input.villageInformation = '';
    }
    const {output} = await prompt(input);
    return output!;
  }
);
