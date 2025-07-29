'use server';

/**
 * @fileOverview Summarizes relevant FAQ entries for the user.
 *
 * - summarizeFAQ - A function that summarizes FAQ entries.
 * - SummarizeFAQInput - The input type for the summarizeFAQ function.
 * - SummarizeFAQOutput - The return type for the summarizeFAQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFAQInputSchema = z.object({
  faqEntries: z.string().describe('A list of FAQ entries to summarize.'),
  query: z.string().describe('The original user query.'),
});
export type SummarizeFAQInput = z.infer<typeof SummarizeFAQInputSchema>;

const SummarizeFAQOutputSchema = z.object({
  summary: z.string().describe('A summary of the relevant FAQ entries.'),
});
export type SummarizeFAQOutput = z.infer<typeof SummarizeFAQOutputSchema>;

export async function summarizeFAQ(input: SummarizeFAQInput): Promise<SummarizeFAQOutput> {
  return summarizeFAQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFAQPrompt',
  input: {schema: SummarizeFAQInputSchema},
  output: {schema: SummarizeFAQOutputSchema},
  prompt: `You are a chatbot that summarizes FAQ entries based on a user query.

  User Query: {{{query}}}

  FAQ Entries: {{{faqEntries}}}

  Summary:`,
});

const summarizeFAQFlow = ai.defineFlow(
  {
    name: 'summarizeFAQFlow',
    inputSchema: SummarizeFAQInputSchema,
    outputSchema: SummarizeFAQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
