'use server';

import { generatePinCodeExplanation } from '@/ai/flows/generate-pin-code-explanation';
import { answerUserQuery } from '@/ai/flows/answer-user-query';
import { addUnansweredConversation, searchPinCodes } from '@/lib/db';
import { answerGeneralQuestion } from '@/ai/flows/answer-general-question';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;

export async function handleUserMessage(message: string): Promise<string> {
  // First, check if the message is a PIN code for a direct match.
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

  // If not a direct PIN code, use the enhanced AI flow.
  try {
    const result = await answerUserQuery({ query: message });
    
    // If the master flow decided to tell a joke, we just return it.
    if (result.isJoke) {
      return result.answer;
    }

    // If the main flow used a tool but found nothing, it will fall back to answerGeneralQuestion.
    // In this case, we log it for review.
    if (result.toolUsed === 'answerGeneralQuestion') {
       await addUnansweredConversation(message, result.answer);
       return result.answer + "\\n\\n(I've logged this question for our team to review.)";
    }

    // Otherwise, the tools found something, so we return the answer.
    return result.answer;

  } catch (error) {
    console.error('Error in primary flow:', error);
    // Ultimate fallback in case of unexpected errors.
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
