// services/chatbot/utilsService.ts

export function cleanUserInput(text: string): string {
  text = text.replace(/(\d),\s*(\d)/g, '$1$2'); // Fix comma spacing: 1, 000 -> 1000
  text = text.replace(/nowversus/g, 'now versus ');
  text = text.replace(/(\d)([a-zA-Z])/g, '$1 $2'); // 100now -> 100 now
  text = text.replace(/([a-zA-Z])(\d)/g, '$1 $2'); // versus100 -> versus 100
  return text;
}

export function sanitizeResponse(text: string): string {
  text = text.replace(/`+/g, '');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
  text = text.replace(/\*([^*]+)\*/g, '$1'); // Remove italics
  text = text.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  text = text.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  text = text.replace(/\s*,\s*/g, ', ');
  return text;
}

export function generateFollowUpQuestions(userInput: string): string[] {
  const lowered = userInput.toLowerCase();
  
  if (lowered.includes('versus')) {
    return [
      "What if I split my investment 50/50 between lump sum and monthly?",
      "What if I delay my lump sum investment by 6 months?",
      "What if markets crash right after my lump sum investment?"
    ];
  } else if (lowered.includes('stop investing')) {
    return [
      "What if I resume investing after 5 years?",
      "What happens if I withdraw everything at retirement?",
      "What if I switch to safer assets after stopping?"
    ];
  } else {
    return [
      "What if I increase my monthly contributions?",
      "What if returns average only 3 percent instead of 7 percent?",
      "What if inflation outpaces my investment returns?"
    ];
  }
}

export default {
  cleanUserInput,
  sanitizeResponse,
  generateFollowUpQuestions
};