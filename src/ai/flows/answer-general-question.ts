'use server';
/**
 * @fileOverview A flow to answer a general knowledge question using Gemini.
 *
 * - answerGeneralQuestion - A function that returns a general knowledge answer.
 * - AnswerGeneralQuestionInput - The input type for the answerGeneralQuestion function.
 * - AnswerGeneralQuestionOutput - The return type for the answerGeneralQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGeneralQuestionInputSchema = z.object({
  query: z.string().describe('The user\'s general knowledge question.'),
});
export type AnswerGeneralQuestionInput = z.infer<typeof AnswerGeneralQuestionInputSchema>;

const AnswerGeneralQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});
export type AnswerGeneralQuestionOutput = z.infer<typeof AnswerGeneralQuestionOutputSchema>;

export async function answerGeneralQuestion(
  input: AnswerGeneralQuestionInput
): Promise<AnswerGeneralQuestionOutput> {
  return answerGeneralQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGeneralQuestionPrompt',
  input: {schema: AnswerGeneralQuestionInputSchema},
  output: {schema: AnswerGeneralQuestionOutputSchema},
  prompt: `You are a helpful AI assistant. Your role is to provide a clear, concise, and accurate answer to the user's question.

User Question: {{{query}}}

Answer:`,
});

const answerGeneralQuestionFlow = ai.defineFlow(
  {
    name: 'answerGeneralQuestionFlow',
    inputSchema: AnswerGeneralQuestionInputSchema,
    outputSchema: AnswerGeneralQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
