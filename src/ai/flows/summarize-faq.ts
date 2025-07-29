
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
import { findMediaTool } from './find-media';

const SummarizeFAQInputSchema = z.object({
  faqEntries: z.string().describe('A list of FAQ entries to summarize.'),
  query: z.string().describe('The original user query.'),
});
export type SummarizeFAQInput = z.infer<typeof SummarizeFAQInputSchema>;

const SummarizeFAQOutputSchema = z.object({
  summary: z.string().describe('A summary of the relevant FAQ entries, or a formatted response containing media links if found.'),
});
export type SummarizeFAQOutput = z.infer<typeof SummarizeFAQOutputSchema>;

export async function summarizeFAQ(input: SummarizeFAQInput): Promise<SummarizeFAQOutput> {
  return summarizeFAQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFAQPrompt',
  input: {schema: SummarizeFAQInputSchema},
  output: {schema: SummarizeFAQOutputSchema},
  tools: [findMediaTool],
  prompt: `You are a helpful chatbot. Your primary role is to answer user questions based on a provided list of FAQs.

If the user asks for media content like a video, image, or reel, you MUST use the findMedia tool to search for it.
If the tool returns results, format them nicely for the user, including the title and the URL.
If the tool returns no results, inform the user that you couldn't find any media on that topic.

For all other questions, find the most relevant FAQ entry and summarize the answer for the user.
If no FAQ entry matches the user's query, state that you couldn't find an answer.

User Query: {{{query}}}

FAQ Entries: {{{faqEntries}}}

Answer:`,
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
