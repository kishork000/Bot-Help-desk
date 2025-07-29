'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { summarizeFAQ } from '@/ai/flows/summarize-faq';
import { faqs, pinCodeData } from '@/lib/data';
import { tellJoke } from '@/ai/flows/tell-joke';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;
const jokeRegex = /joke/i;

export async function handleUserMessage(message: string): Promise<string> {
  const pinCodeMatch = message.match(pinCodeRegex);
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
  
  if (pinCodeMatch) {
    const pinCode = pinCodeMatch[0];
    const villageInfo = pinCodeData[pinCode];

    if (villageInfo) {
      try {
        const result = await generatePinCodeExplanation({
          pinCode,
          villageInformation: villageInfo,
        });
        return result.explanation;
      } catch (error) {
        console.error('Error calling generatePinCodeExplanation:', error);
        return 'Sorry, I had trouble getting information for that PIN code. Please try again later.';
      }
    } else {
      console.log(`Unknown PIN code query: ${pinCode}`); // Query Logging
      return `I don't have information for the PIN code ${pinCode}. I've logged this for future improvement.`;
    }
  }

  try {
    const faqEntriesString = faqs
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join('\n\n');
      
    const result = await summarizeFAQ({
      query: message,
      faqEntries: faqEntriesString,
    });
    return result.summary;
  } catch (error) {
    console.error('Error calling summarizeFAQ:', error);
    // Log the user's message when the chatbot can't find an answer
    console.log(`Unanswered query: ${message}`);
    return "I couldn't find a specific answer for your question. I've logged it for review. Is there anything else I can help with?";
  }
}
