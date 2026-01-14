// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getChatResponse } from '@/services/chatbot/chatbotService';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Call the service
    const assistantMessage = await getChatResponse(messages);

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}