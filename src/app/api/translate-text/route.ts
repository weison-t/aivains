import OpenAI from "openai";

export const runtime = "nodejs";

type TranslateTextRequest = {
  text: string;
  targetLanguage: "English" | "中文" | "ไทย" | "Bahasa Melayu";
};

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    }
    const body = (await req.json()) as TranslateTextRequest;
    const { text, targetLanguage } = body || {};
    if (!text || !targetLanguage) {
      return Response.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Translate the provided document text into ${targetLanguage}. Keep headings and lists readable. Return only the translation.`,
        },
        { role: "user", content: text.slice(0, 15000) },
      ],
    });
    const translated = completion.choices?.[0]?.message?.content || "";
    return Response.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

