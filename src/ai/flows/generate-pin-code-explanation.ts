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
  prompt: `You are an expert in local Indian geography and history. You will use your knowledge, along with village information to explain the significance of a PIN code.

  Village Information: {{{villageInformation}}}
  PIN code: {{{pinCode}}}

  Explain the significance of the provided PIN code based on the village information. Focus on historical, cultural, and geographical aspects.  The PIN code explanation should be concise and easy to understand by the user.`,
});

const generatePinCodeExplanationFlow = ai.defineFlow(
  {
    name: 'generatePinCodeExplanationFlow',
    inputSchema: GeneratePinCodeExplanationInputSchema,
    outputSchema: GeneratePinCodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
