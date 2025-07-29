'use server';
/**
 * @fileOverview A Genkit tool for searching the PIN code database.
 */

import {ai} from '@/ai/genkit';
import {searchPinCodes} from '@/lib/db';
import {z} from 'genkit';

export const findPinCodeInfoTool = ai.defineTool(
  {
    name: 'findPinCodeInfo',
    description:
      'Searches for information about a specific location, city, or PIN code. Use this if the user asks about a place or provides a 6-digit PIN code.',
    inputSchema: z.object({
        query: z.string().describe('The location, city, or PIN code to search for.'),
    }),
    outputSchema: z.array(
        z.object({
          pincode: z.string(),
          info: z.string(),
        })
    ),
  },
  async input => {
    console.log(`Searching PIN codes with query: ${input.query}`);
    const results = await searchPinCodes(input.query);
    console.log(`Found ${results.length} PIN code info items.`);
    return results;
  }
);
