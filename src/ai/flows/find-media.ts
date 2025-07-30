
'use server';
/**
 * @fileOverview A Genkit tool for finding media content in the database.
 * 
 * - findMediaTool - A tool that can be used by other flows to search for media.
 */

import { ai } from '@/ai/genkit';
import { searchMedia } from '@/lib/db';
import { z } from 'genkit';

const MediaSearchInputSchema = z.object({
    query: z.string().describe('The search term for the media content.'),
});

const MediaSearchOutputSchema = z.array(z.object({
    id: z.number(),
    title: z.string(),
    type: z.string(),
    url: z.string(),
}));

export const findMedia = ai.defineFlow({
    name: 'findMediaFlow',
    inputSchema: MediaSearchInputSchema,
    outputSchema: MediaSearchOutputSchema,
}, async (input) => {
    console.log(`Searching for media with query: ${input.query}`);
    const results = await searchMedia(input.query);
    console.log(`Found ${results.length} media items.`);
    return results;
});


export const findMediaTool = ai.defineTool(
  {
    name: 'findMedia',
    description: 'Searches for relevant media (videos, images, reels) based on a user query. Use this if the user asks for a video, image, or reel about a specific topic.',
    inputSchema: MediaSearchInputSchema,
    outputSchema: MediaSearchOutputSchema,
  },
  findMedia
);
