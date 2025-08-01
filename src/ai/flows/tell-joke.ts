'use server';
/**
 * @fileOverview A flow that tells a random joke.
 *
 * - tellJoke - A function that returns a random joke.
 * - tellJokeTool - A Genkit tool that tells a joke.
 * - TellJokeOutput - The return type for the tellJoke function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TellJokeOutputSchema = z.object({
  joke: z.string().describe('A random, family-friendly joke.'),
});
export type TellJokeOutput = z.infer<typeof TellJokeOutputSchema>;

export async function tellJoke(): Promise<TellJokeOutput> {
  return tellJokeFlow();
}

const prompt = ai.definePrompt({
  name: 'tellJokePrompt',
  output: {schema: TellJokeOutputSchema},
  prompt: `Tell me a random, family-friendly joke.`,
});

const tellJokeFlow = ai.defineFlow(
  {
    name: 'tellJokeFlow',
    outputSchema: TellJokeOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);

export const tellJokeTool = ai.defineTool(
  {
    name: 'tellJoke',
    description: 'Tells a random, family-friendly joke. Use this if the user explicitly asks for a joke.',
    outputSchema: z.object({ joke: z.string() }),
  },
  async () => (await tellJoke()).joke,
);
