import OpenAI from "openai";

export const runtime = "nodejs";

type ChatRole = "system" | "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
};

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const body = (await req.json()) as ChatRequestBody;
    if (!body || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "Invalid request body. Expected { messages: ChatMessage[] }." },
        { status: 400 }
      );
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content:
        [
          "You are AIVA, an insurance assistant for Aetherion Dataworks.",
          "Supported languages: English, Chinese (中文), Thai (ไทย), Malay (Bahasa Melayu).",
          "Detect the user's language from ONLY the latest user message. Ignore any assistant messages when inferring language.",
          "If the latest user message explicitly asks about language support (e.g. 'what languages', 'which languages', 'do you support <lang>', 'can you reply in <lang>'), reply with exactly: 'Yes, I can currently reply in English, 中文, ไทย, and Bahasa Melayu. You may continue in one of these languages.' and NOTHING ELSE.",
          "If the latest user message is in a SUPPORTED language (English/中文/ไทย/Bahasa Melayu) and is NOT a language-support question, answer fully in that language. Do NOT mention languages, do NOT apologize, and do NOT add any disclaimers.",
          "ONLY if the latest user message is NOT in a supported language, reply in English with exactly: 'Sorry, I can currently reply in English, 中文, ไทย, and Bahasa Melayu. Please continue in one of these languages.' Then proceed to answer the user's request in English.",
          "Return only the answer to the user's request (no preface). Be concise, polite, and accurate about claims, policies, appointments, and documents. If unsure, ask for clarification.",
        ].join(" "),
    };

    const messages: ChatMessage[] = [systemPrompt, ...body.messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return Response.json({ message: { role: "assistant", content } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

