
'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { summarizeFAQ } from '@/ai/flows/summarize-faq';
import { getDb, addUnansweredConversation } from '@/lib/db';
import { tellJoke } from '@/ai/flows/tell-joke';
import { answerGeneralQuestion } from '@/ai/flows/answer-general-question';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;
const jokeRegex = /joke/i;

export async function handleUserMessage(message: string): Promise<string> {
  const db = await getDb();
  const jokeMatch = message.match(jokeRegex);

  if (jokeMatch) {
    try {
      const result = await tellJoke();
      return result.joke;
    } catch (error) {
      console.error('Error calling tellJoke:', error);
      return "Sorry, I couldn't think of a joke right now. Please try again later.";
    }
  }

  const pinCodeMatch = message.match(pinCodeRegex);
  if (pinCodeMatch) {
    const pinCode = pinCodeMatch[0];
    const villageInfo = await db.get('SELECT info FROM pincodes WHERE pincode = ?', pinCode);

    try {
      const result = await generatePinCodeExplanation({
        pinCode,
        villageInformation: villageInfo?.info || 'No local information available.',
      });
      // If we didn't have local info, we save the AI's answer for review.
      if (!villageInfo) {
          await addUnansweredConversation(`PIN code: ${pinCode}`, result.explanation);
      }
      return result.explanation;
    } catch (error) {
      console.error('Error calling generatePinCodeExplanation:', error);
      return 'Sorry, I had trouble getting information for that PIN code. Please try again later.';
    }
  }

  try {
    const faqs = await db.all('SELECT question, answer FROM faqs');
    const faqEntriesString = faqs
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join('\n\n');
      
    const result = await summarizeFAQ({
      query: message,
      faqEntries: faqEntriesString,
    });

    // A bit of a heuristic: if the summary is very short or doesn't seem to answer, fallback.
    if (result.summary.length < 20 || !result.summary.includes(' ')) {
       // Throw an error to trigger the fallback logic in the catch block
       throw new Error("Summary not sufficient, fallback to general knowledge.");
    }

    return result.summary;
  } catch (error) {
    console.log("FAQ summarization failed or was insufficient, trying general knowledge fallback. Error:", error);
    try {
        const generalAnswer = await answerGeneralQuestion({ query: message });
        await addUnansweredConversation(message, generalAnswer.answer);
        return generalAnswer.answer + "\n\n(I've logged this question for our team to review.)";
    } catch (genError) {
        console.error('Error calling answerGeneralQuestion:', genError);
        return "I'm having trouble finding an answer right now. Please try asking something else.";
    }
  }
}
