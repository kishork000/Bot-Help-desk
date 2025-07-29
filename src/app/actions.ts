
'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { summarizeFAQ } from '@/ai/flows/summarize-faq';
import { addUnansweredQuery, getDb } from '@/lib/db';
import { tellJoke } from '@/ai/flows/tell-joke';

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

    if (villageInfo) {
      try {
        const result = await generatePinCodeExplanation({
          pinCode,
          villageInformation: villageInfo.info,
        });
        return result.explanation;
      } catch (error)        {
        console.error('Error calling generatePinCodeExplanation:', error);
        return 'Sorry, I had trouble getting information for that PIN code. Please try again later.';
      }
    } else {
      await addUnansweredQuery(`PIN code: ${pinCode}`);
      return `I don't have information for the PIN code ${pinCode}. I've logged this for future improvement.`;
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

    // A bit of a heuristic: if the summary is very short, it might not be a good answer.
    // A more robust solution would be to have the Genkit flow return a confidence score.
    if (result.summary.length < 20 || !result.summary.includes(' ')) {
        await addUnansweredQuery(message);
        return "I couldn't find a specific answer for your question in my knowledge base. I've logged it for review. Is there anything else I can help with?";
    }

    return result.summary;
  } catch (error) {
    console.error('Error calling summarizeFAQ:', error);
    await addUnansweredQuery(message);
    return "I couldn't find a specific answer for your question. I've logged it for review. Is there anything else I can help with?";
  }
}
