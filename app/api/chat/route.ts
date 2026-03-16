// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildUserProgressContext,
  buildCurriculumSummary,
} from "@/lib/zenbot-context";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_SYSTEM_PROMPT = `You are ZenBot, a financial education chatbot inside a learning app called Zentra. You help users understand personal finance and investing through clear, beginner-friendly answers.

Important safety rules:
- Never give personalized financial advice.
- Never recommend specific stocks, funds, or investment products.
- Never predict future performance or guarantee returns.
- If a question asks for advice, offer a disclaimer and give general education instead.

Formatting rules:
- Output must be plain text only. No Markdown, no emojis.
- Keep answers short (3-6 sentences).
- Use simple examples, not real market data.
- End with one general takeaway and a reminder that this is for education only.`;

function buildSystemPrompt(
  lessonProgress?: Record<string, Record<string, boolean>>
): string {
  const curriculum = buildCurriculumSummary();

  if (!lessonProgress || Object.keys(lessonProgress).length === 0) {
    return `${BASE_SYSTEM_PROMPT}

--- ZENTRA CURRICULUM ---
The app teaches these 10 modules in order:
${curriculum}

The user has not started any modules yet. Keep explanations very beginner-friendly and avoid assuming prior knowledge.`;
  }

  const progressSummary = buildUserProgressContext(lessonProgress);

  // Figure out how far along the user is
  const completedModules = Object.values(lessonProgress).filter(
    (mod) => Object.values(mod).filter(Boolean).length >= 3
  ).length;

  const totalLessonsCompleted = Object.values(lessonProgress).reduce(
    (acc, mod) => acc + Object.values(mod).filter(Boolean).length,
    0
  );

  const experienceLevel =
    completedModules >= 7
      ? "advanced"
      : completedModules >= 4
      ? "intermediate"
      : completedModules >= 1
      ? "beginner-intermediate"
      : "complete beginner";

  return `${BASE_SYSTEM_PROMPT}

--- ZENTRA CURRICULUM ---
The app teaches these 10 modules in order:
${curriculum}

--- USER LEARNING PROGRESS ---
This user has completed ${totalLessonsCompleted} lessons across ${completedModules} modules. Their experience level is: ${experienceLevel}.

Module-by-module breakdown:
${progressSummary}

--- HOW TO USE THIS CONTEXT ---
- If the user asks about a topic they have already covered, you can reference it directly (e.g. "As you learned in the budgeting module...").
- If they ask about a topic from an upcoming module they haven't reached yet, briefly introduce it and mention it's covered later in Zentra.
- Calibrate your explanation depth to their experience level: ${experienceLevel}.
- Do not overwhelm beginners with advanced concepts they haven't encountered yet.
- If they seem confused about something from a completed module, offer a quick recap.`;
}

type IncomingMsg = { role: string; content: string };

function normalizeMessages(input: unknown) {
  const arr = Array.isArray(input) ? (input as IncomingMsg[]) : [];
  return arr
    .filter((m) => m && typeof m.content === "string")
    .map((m) => {
      const role =
        m.role === "assistant" || m.role === "system" ? m.role : "user";
      return {
        role: role as "user" | "assistant" | "system",
        content: m.content,
      };
    })
    .filter((m) => m.role !== "system");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = normalizeMessages(body?.messages);
    const lessonProgress = body?.lessonProgress as
      | Record<string, Record<string, boolean>>
      | undefined;

    if (messages.length === 0) {
      return NextResponse.json(
        {
          error:
            "No messages provided. Send { messages: [{ role, content }], lessonProgress: {...} }",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(lessonProgress);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 350,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
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