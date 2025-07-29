'use server';
/**
 * @fileOverview A Genkit tool for searching the FAQ database.
 */

import {ai} from '@/ai/genkit';
import {searchFaqs} from '@/lib/db';
import {z} from 'genkit';

export const findFaqTool = ai.defineTool(
  {
    name: 'findFaq',
    description:
      "Searches the Frequently Asked Questions (FAQs) for an answer to a user's query. Use this for general questions about services or processes.",
    inputSchema: z.object({
        query: z.string().describe("The user's question to search for."),
    }),
    outputSchema: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
    ),
  },
  async input => {
    console.log(`Searching FAQs with query: ${input.query}`);
    const results = await searchFaqs(input.query);
    console.log(`Found ${results.length} FAQ items.`);
    return results;
  }
);
