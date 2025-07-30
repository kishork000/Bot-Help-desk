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
import {tellJokeTool} from './tell-joke';
import {answerGeneralQuestion} from './answer-general-question';

const AnswerUserQueryInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
});
export type AnswerUserQueryInput = z.infer<typeof AnswerUserQueryInputSchema>;

const AnswerUserQueryOutputSchema = z.object({
  answer: z.string().describe('The final answer to the user.'),
  toolUsed: z
    .string()
    .optional()
    .describe('The name of the tool that was used to generate the answer.'),
});
export type AnswerUserQueryOutput = z.infer<typeof AnswerUserQueryOutputSchema>;

export async function answerUserQuery(
  input: AnswerUserQueryInput
): Promise<AnswerUserQueryOutput> {
  return answerUserQueryFlow(input);
}

const answerUserQueryPrompt = ai.definePrompt({
  name: 'answerUserQueryPrompt',
  input: {schema: AnswerUserQueryInputSchema},
  output: {schema: z.object({answer: z.string()})},
  tools: [findFaqTool, findPinCodeInfoTool, findMediaTool, tellJokeTool],
  system: `You are a helpful AI assistant for a public service chatbot. Your goal is to provide accurate and relevant information to users.

- You have access to a set of tools to find specific information.
- If the user asks for an FAQ, information about a PIN code/location, or for media content (video, image, reel), you MUST use the appropriate tool.
- If the user asks for a joke, you MUST use the 'tellJoke' tool.
- If the user's query is a general question and does not fit any of the tool descriptions, you should answer it from your own knowledge.
- If a tool returns results, use the information from the tool to formulate your answer.
- If a tool returns no results, inform the user that you couldn't find any information on that topic.
- Do not make up information. If you don't know the answer and the tools don't help, say that you don't know.
- For media requests, if you find a result, format it as a clean markdown link like this: "I found this for you: [Title](URL)". Do not just output raw data.
`,
});

const answerUserQueryFlow = ai.defineFlow(
  {
    name: 'answerUserQueryFlow',
    inputSchema: AnswerUserQueryInputSchema,
    outputSchema: AnswerUserQueryOutputSchema,
  },
  async input => {
    const llmResponse = await answerUserQueryPrompt(input);
    const toolUsed = llmResponse.history?.[0]?.role === 'tool' ? llmResponse.history[0].part.toolRequest.name : undefined;

    const answer = llmResponse.output?.answer;

    if (!answer) {
        console.log("Main flow failed to produce an answer, falling back to general question.");
        const fallbackAnswer = await answerGeneralQuestion(input);
        return {
            answer: fallbackAnswer.answer,
            toolUsed: 'answerGeneralQuestion',
        };
    }

    return {
      answer,
      toolUsed: toolUsed || (answer ? undefined : 'answerGeneralQuestion'),
    };
  }
);
