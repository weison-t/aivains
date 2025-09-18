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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 500 }
      );
    }

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
        "You are AIVA, an insurance assistant for Aetherion Dataworks. Be concise, helpful, and accurate about claims, policies, appointments, and documents. If unsure, ask for clarification.",
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

