
'use server';
/**
 * @fileOverview A Genkit tool for finding media content in the database.
 * 
 * - findMediaTool - A tool that can be used by other flows to search for media.
 */

import { ai } from '@/ai/genkit';
import { searchMedia } from '@/lib/db';
import { z } from 'genkit';

export const findMediaTool = ai.defineTool(
  {
    name: 'findMedia',
    description: 'Searches for relevant media (videos, images, reels) based on a user query. Use this if the user asks for a video, image, or reel about a specific topic.',
    input: {
        schema: z.object({
            query: z.string().describe('The search term for the media content.'),
        })
    },
    output: {
        schema: z.array(z.object({
            id: z.number(),
            title: z.string(),
            type: z.string(),
            url: z.string(),
        }))
    },
  },
  async (input) => {
    console.log(`Searching for media with query: ${input.query}`);
    const results = await searchMedia(input.query);
    console.log(`Found ${results.length} media items.`);
    return results;
  }
);
