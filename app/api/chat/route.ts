// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // important so process.env works reliably

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are ZenBot, a financial education chatbot designed for beginners inside a simulation game called Zentra. You help users understand general personal finance topics, investing concepts, and common scenarios through short, simple answers.

Important safety rules:
- Never give personalized financial advice.
- Never recommend specific stocks, funds, or investment products.
- Never predict future performance or guarantee returns.
- If a question asks for advice, respond with a disclaimer and offer general education instead.

Formatting rules:
- Output must be plain text only. No Markdown, no emojis.
- Keep answers short (3–6 sentences).
- Use simple examples, not real market data.
- End with one general takeaway and a reminder that it is for education only.`;

type IncomingMsg = { role: string; content: string };

function normalizeMessages(input: unknown) {
  const arr = Array.isArray(input) ? (input as IncomingMsg[]) : [];
  const cleaned = arr
    .filter((m) => m && typeof m.content === "string")
    .map((m) => {
      const role =
        m.role === "assistant" || m.role === "system" ? m.role : "user";
      return { role: role as "user" | "assistant" | "system", content: m.content };
    });

  // Prevent users from injecting a system prompt
  return cleaned.filter((m) => m.role !== "system");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = normalizeMessages(body?.messages);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided. Send { messages: [{ role, content }] }" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 350,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({ message: text });
  } catch (err: any) {
    console.error("Chat API Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
