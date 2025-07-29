'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { answerUserQuery } from '@/ai/flows/answer-user-query';
import { getDb, addUnansweredConversation, searchPinCodes } from '@/lib/db';
import { answerGeneralQuestion } from '@/ai/flows/answer-general-question';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;

export async function handleUserMessage(message: string): Promise<string> {
  const db = await getDb();

  // First, check if the message is a PIN code.
  const pinCodeMatch = message.match(pinCodeRegex);
  if (pinCodeMatch) {
      const pinCode = pinCodeMatch[0];
      const pinCodeInfo = await searchPinCodes(pinCode);
      const villageInformation = pinCodeInfo.length > 0 ? pinCodeInfo[0].info : 'No local information available.';
      
      const explanation = await generatePinCodeExplanation({ pinCode, villageInformation });
      
      // If we didn't have local info, save the response for review.
      if (villageInformation === 'No local information available.') {
         await addUnansweredConversation(`PIN code: ${pinCode}`, explanation.explanation);
      }

      return explanation.explanation;
  }

  // If not a PIN code, let the new master flow try to answer.
  try {
    const result = await answerUserQuery({ query: message });
    
    // If the master flow decided to tell a joke, we just return it.
    if (result.isJoke) {
      return result.answer;
    }

    // Heuristic: If the answer is very short or seems like a refusal, it might have failed.
    // Let's fallback to the general knowledge flow.
    const isRefusal = /don't know|cannot answer|unable to find/i.test(result.answer);
    if (result.answer.length < 25 && isRefusal) {
       throw new Error("Answer from tools was insufficient, fallback to general knowledge.");
    }

    return result.answer;

  } catch (error) {
    console.log("Primary query flow failed or was insufficient, trying general knowledge fallback. Error:", error);
    try {
        const generalAnswer = await answerGeneralQuestion({ query: message });
        await addUnansweredConversation(message, generalAnswer.answer);
        return generalAnswer.answer + "\\n\\n(I've logged this question for our team to review.)";
    } catch (genError) {
        console.error('Error in fallback flow:', genError);
        return "I'm having trouble finding an answer right now. Please try asking something else.";
    }
  }
}
