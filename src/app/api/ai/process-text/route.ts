import OpenAI from "openai";

export const runtime = "nodejs";

type Mode = "chat" | "summarize" | "translate";

type Body = {
  text: string;
  mode?: Mode;
  targetLang?: "English" | "中文" | "ไทย" | "Bahasa Melayu";
  question?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    const openai = new OpenAI({ apiKey });

    const { text, mode = "chat", targetLang = "English", question = "" } = (await req.json()) as Body;
    if (!text || !text.trim()) return Response.json({ error: "No text provided." }, { status: 400 });

    if (mode === "translate") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: `Translate the following into ${targetLang}. Return only the translation.` },
          { role: "user", content: text.slice(0, 15000) },
        ],
      });
      const content = completion.choices?.[0]?.message?.content || "";
      return Response.json({ content });
    }

    if (mode === "summarize") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: "Summarize the document in concise bullet points. Be factual and short." },
          { role: "user", content: text.slice(0, 15000) },
        ],
      });
      const content = completion.choices?.[0]?.message?.content || "";
      return Response.json({ content });
    }

    // chat / QA
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Answer the user's question using only the provided text. If missing info, state what is missing succinctly." },
        { role: "user", content: `Text:\n\n${text.slice(0, 15000)}\n\nQuestion: ${question || "Explain this."}` },
      ],
    });
    const content = completion.choices?.[0]?.message?.content || "";
    return Response.json({ content });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

