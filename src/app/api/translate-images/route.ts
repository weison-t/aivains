import OpenAI from "openai";

export const runtime = "nodejs";

type TranslateImagesRequest = {
  images?: string[]; // data URLs or remote URLs
  imageUrl?: string; // single remote URL
  targetLanguage?: "English" | "中文" | "ไทย" | "Bahasa Melayu";
  mode?: "translate" | "summarize" | "qa";
  question?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    }
    const body = (await req.json()) as TranslateImagesRequest;
    const { images, imageUrl, targetLanguage, mode = "translate", question } = body || {};
    if ((!Array.isArray(images) || images.length === 0) && !imageUrl) {
      return Response.json({ error: "Missing images or imageUrl" }, { status: 400 });
    }
    if (mode === "translate" && !targetLanguage) {
      return Response.json({ error: "Missing targetLanguage" }, { status: 400 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let instruction = "";
    if (mode === "translate") {
      instruction = `Extract readable text from ${imageUrl ? "this image" : "these page images"} and translate into ${targetLanguage}. Keep structure and headings.`;
    } else if (mode === "summarize") {
      instruction = `Extract readable text from ${imageUrl ? "this image" : "these page images"} and summarize concisely in bullet points.`;
    } else {
      instruction = `Extract readable text from ${imageUrl ? "this image" : "these page images"} and answer the question: ${question || "Explain this document."}. If insufficient info, say what's missing.`;
    }

    const userContent: any[] = [{ type: "text", text: instruction }];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images.slice(0, 5)) {
        userContent.push({ type: "image_url", image_url: { url: img, detail: "high" } });
      }
    } else if (imageUrl) {
      userContent.push({ type: "image_url", image_url: { url: imageUrl, detail: "high" } });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a precise OCR assistant that can translate, summarize, or answer questions from extracted text." },
        { role: "user", content: userContent as any },
      ],
    });

    const translated = completion.choices?.[0]?.message?.content || "";
    return Response.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

