'use server';
/**
 * @fileOverview The main query engine for the chatbot.
 *
 * This flow is responsible for receiving a user's query and determining the best
 * way to answer it by using a set of specialized tools. It first analyzes the user's
 * intent to select the correct tool, then executes that tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {findMedia} from './find-media';
import {findFaq} from './find-faq';
import {findPinCodeInfo} from './find-pincode-info';
import {tellJoke} from './tell-joke';
import {answerGeneralQuestion} from './answer-general-question';

const AnswerUserQueryInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
});
export type AnswerUserQueryInput = z.infer<typeof AnswerUserQueryInputSchema>;

const AnswerUserQueryOutputSchema = z.object({
  answer: z.string().describe('The final answer to the user.'),
  isJoke: z.boolean().optional().describe('Set to true if the answer is a joke.'),
  toolUsed: z
    .string()
    .optional()
    .describe('The name of the tool that was used to generate the answer.'),
});
export type AnswerUserQueryOutput = z.infer<typeof AnswerUserQueryOutputSchema>;

export async function answerUserQuery(
  input: AnswerUserQueryInput
): Promise<AnswerUserQueryOutput> {
  // A specific check for jokes, since it's a very different kind of request.
  if (/joke/i.test(input.query)) {
    const jokeResult = await tellJoke();
    return {answer: jokeResult.joke, isJoke: true};
  }
  return answerUserQueryFlow(input);
}

const intentAnalysisPrompt = ai.definePrompt({
  name: 'userIntentAnalysisPrompt',
  input: {schema: AnswerUserQueryInputSchema},
  output: {
    schema: z.object({
      intent: z
        .enum(['faq', 'pincode', 'media', 'greeting', 'other'])
        .describe("The user's likely intent."),
    }),
  },
  prompt: `You are an expert at analyzing user queries to determine their intent.
- If the user asks for a video, image, or reel, the intent is 'media'.
- If the user asks about a specific location, city, or provides a PIN code, the intent is 'pincode'.
- If the user asks a general question that might be in an FAQ, the intent is 'faq'.
- If the user is just saying hello or making small talk, the intent is 'greeting'.
- For anything else, the intent is 'other'.

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
    // Step 1: Analyze Intent
    const {output: intentOutput} = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Analyze the user's query to determine their intent.
- If the user asks for a video, image, or reel, the intent is 'media'.
- If the user asks about a specific location, city, or provides a PIN code, the intent is 'pincode'.
- If the user asks a general question that might be in an FAQ, the intent is 'faq'.
- If the user is just saying hello or making small talk, the intent is 'greeting'.
- For anything else, the intent is 'other'.
User Question: ${input.query}`,
      output: {
        schema: z.object({
          intent: z.enum(['faq', 'pincode', 'media', 'greeting', 'other']),
        }),
      },
    });
    const intent = intentOutput?.intent || 'other';

    console.log(`Determined intent: ${intent} for query: "${input.query}"`);

    // Step 2: Execute Tool Based on Intent
    if (intent === 'faq') {
      const results = await findFaq({query: input.query});
      if (results.length > 0) {
        const combinedAnswers = results
          .map(r => `Q: ${r.question}\nA: ${r.answer}`)
          .join('\n\n');
        return {
          answer: `I found some information that might help:\n\n${combinedAnswers}`,
          toolUsed: 'findFaq',
        };
      }
    } else if (intent === 'pincode') {
      const results = await findPinCodeInfo({query: input.query});
      if (results.length > 0) {
        const combinedInfo = results
          .map(r => `${r.pincode}: ${r.info}`)
          .join('\n');
        return {
          answer: `Here is the information I found for your location:\n\n${combinedInfo}`,
          toolUsed: 'findPinCodeInfo',
        };
      }
    } else if (intent === 'media') {
      const results = await findMedia({query: input.query});
      if (results.length > 0) {
        // Let an LLM pick the best result and format it.
        const {output: mediaOutput} = await ai.generate({
          model: 'googleai/gemini-2.0-flash',
          prompt: `From the following list of media items, pick the single best match for the user's query and format it as a markdown link.
          User Query: "${input.query}"
          Media Items:
          ${JSON.stringify(results, null, 2)}
          
          Response format: "I found this for you: [title](url)"`,
          output: {
            schema: z.object({
              response: z.string(),
            }),
          },
        });

        if (mediaOutput) {
          return {answer: mediaOutput.response, toolUsed: 'findMedia'};
        }
      }
    }

    // Step 3: Fallback for 'greeting', 'other', or if tools find nothing
    const generalAnswer = await answerGeneralQuestion(input);
    return {answer: generalAnswer.answer, toolUsed: 'answerGeneralQuestion'};
  }
);
