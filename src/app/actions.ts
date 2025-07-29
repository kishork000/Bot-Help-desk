'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { summarizeFAQ } from '@/ai/flows/summarize-faq';
import { faqs, pinCodeData } from '@/lib/data';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;

export async function handleUserMessage(message: string): Promise<string> {
  const pinCodeMatch = message.match(pinCodeRegex);

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
    return 'Sorry, I had trouble understanding your question. Could you please rephrase it?';
  }
}
