'use server';
/**
 * @fileOverview The main query engine for the chatbot.
 *
 * This flow is responsible for receiving a user's query and determining the best
 * way to answer it by using a set of specialized tools.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {findMediaTool} from './find-media';
import {findFaqTool} from './find-faq';
import {findPinCodeInfoTool} from './find-pincode-info';
import {tellJoke} from './tell-joke';

const AnswerUserQueryInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
});
export type AnswerUserQueryInput = z.infer<typeof AnswerUserQueryInputSchema>;

const AnswerUserQueryOutputSchema = z.object({
  answer: z.string().describe('The final answer to the user.'),
  isJoke: z.boolean().optional().describe('Set to true if the answer is a joke.'),
});
export type AnswerUserQueryOutput = z.infer<typeof AnswerUserQueryOutputSchema>;

export async function answerUserQuery(
  input: AnswerUserQueryInput
): Promise<AnswerUserQueryOutput> {
  // A specific check for jokes, since it's a very different kind of request.
  if (/joke/i.test(input.query)) {
    const jokeResult = await tellJoke();
    return { answer: jokeResult.joke, isJoke: true };
  }
  return answerUserQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerUserQueryPrompt',
  input: {schema: AnswerUserQueryInputSchema},
  output: {schema: AnswerUserQueryOutputSchema},
  tools: [findFaqTool, findPinCodeInfoTool, findMediaTool],
  prompt: `You are a helpful AI assistant. Your primary goal is to answer the user's question as accurately as possible.

You have access to a set of tools to find information from a local knowledge base.
- Use 'findFaq' to answer general questions. If the tool returns a result with a relevant answer, you MUST use the value of the 'answer' field from the tool's output as your response.
- Use 'findPinCodeInfo' if the user asks about a specific location, city, or provides a PIN code.
- Use 'findMedia' if the user is asking for a video, image, or reel. If you find media, you MUST format the links nicely in your response, including the title and the URL.

Prioritize using the tools over your own general knowledge. If the tools return relevant information, you MUST use that information to construct your answer.
If the tools do not return any relevant information, you may use your own general knowledge to answer the question.

If you find media, format the links nicely in your response.

User Question: {{{query}}}
`,
});

const answerUserQueryFlow = ai.defineFlow(
  {
    name: 'answerUserQueryFlow',
    inputSchema: AnswerUserQueryInputSchema,
    outputSchema: AnswerUserQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
