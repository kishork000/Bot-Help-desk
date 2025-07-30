'use server';

import {
  generatePinCodeExplanation,
} from '@/ai/flows/generate-pin-code-explanation';
import {answerUserQuery} from '@/ai/flows/answer-user-query';
import {addUnansweredConversation, searchPinCodes} from '@/lib/db';
import {answerGeneralQuestion} from '@/ai/flows/answer-general-question';

const pinCodeRegex = /(?<!\d)\d{6}(?!\d)/;

export async function handleUserMessage(message: string): Promise<string> {
  // First, check if the message is a PIN code for a direct match, as this is a very specific intent.
  const pinCodeMatch = message.match(pinCodeRegex);
  if (pinCodeMatch) {
    const pinCode = pinCodeMatch[0];
    const pinCodeInfo = await searchPinCodes(pinCode);
    const villageInformation =
      pinCodeInfo.length > 0
        ? pinCodeInfo[0].info
        : 'No local information available.';

    const explanation = await generatePinCodeExplanation({
      pinCode,
      villageInformation,
    });
    
    return explanation.explanation;
  }

  // If not a direct PIN code, use the enhanced AI flow.
  try {
    const result = await answerUserQuery({query: message});

    // If no specific tool was used, it means the bot answered from general knowledge.
    // We log these for review to see if a new tool or FAQ is needed.
    if (!result.toolUsed) {
       await addUnansweredConversation(message, result.answer);
    }

    return result.answer;
  } catch (error) {
    console.error('Error in primary flow:', error);
    // Ultimate fallback in case of unexpected errors in the main flow.
    try {
      const generalAnswer = await answerGeneralQuestion({query: message});
      await addUnansweredConversation(message, generalAnswer.answer);
      return generalAnswer.answer;
    } catch (genError) {
      console.error('Error in fallback flow:', genError);
      return "I'm having trouble finding an answer right now. Please try asking something else.";
    }
  }
}
