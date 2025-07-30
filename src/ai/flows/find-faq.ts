'use server';
/**
 * @fileOverview A Genkit tool for searching the FAQ database.
 */

import {ai} from '@/ai/genkit';
import {searchFaqs} from '@/lib/db';
import {z} from 'genkit';

const FaqSearchInputSchema = z.object({
  query: z.string().describe("The user's question to search for."),
});

const FaqSearchOutputSchema = z.array(
  z.object({
    question: z.string(),
    answer: z.string(),
  })
);

const FaqSearchQueryGenInputSchema = z.object({
  query: z.string().describe("The user's question to analyze."),
});

const FaqSearchQueryGenOutputSchema = z.object({
  searchQuery: z
    .string()
    .describe(
      'A concise search query, containing 3-5 key terms, derived from the user\'s question to effectively search the database.'
    ),
});

const searchQueryGenerator = ai.definePrompt({
  name: 'faqSearchQueryGenerator',
  input: {schema: FaqSearchQueryGenInputSchema},
  output: {schema: FaqSearchQueryGenOutputSchema},
  prompt: `Analyze the user's question and generate a concise search query of 3-5 key terms that can be used to find the most relevant answer in a database.

User Question: {{{query}}}
`,
});

export const findFaq = ai.defineFlow(
  {
    name: 'findFaqFlow',
    inputSchema: FaqSearchInputSchema,
    outputSchema: FaqSearchOutputSchema,
  },
  async input => {
    console.log(`Original user query for FAQ search: ${input.query}`);

    // Generate a smarter search query using the LLM.
    const llmResponse = await searchQueryGenerator({query: input.query});
    const smartQuery = llmResponse.output?.searchQuery || input.query;
    console.log(`Generated smart search query: ${smartQuery}`);

    // Use the new smart query to search the database.
    const results = await searchFaqs(smartQuery);
    console.log(`Found ${results.length} FAQ items with smart query.`);
    return results;
  }
);

export const findFaqTool = ai.defineTool(
  {
    name: 'findFaq',
    description:
      "Searches the Frequently Asked Questions (FAQs) for an answer to a user's query. Use this for general questions about services or processes.",
    inputSchema: FaqSearchInputSchema,
    outputSchema: FaqSearchOutputSchema,
  },
  findFaq
);
