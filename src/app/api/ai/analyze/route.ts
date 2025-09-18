import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export const runtime = "nodejs";

type Mode = "chat" | "summarize" | "translate";

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const parsePdf = (await import("pdf-parse")).default as (b: Buffer) => Promise<{ text: string }>;
    const res = await parsePdf(buffer);
    if (res.text && res.text.trim()) return res.text.trim();
  } catch {}
  return "";
}

// We avoid server-side pdfjs OCR on Vercel due to module resolution limits.
// Client-side OCR fallback is implemented when server returns no text.

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey });

    const form = await req.formData();
    const mode = (form.get("mode") as string) as Mode || "chat";
    const targetLanguage = (form.get("targetLang") as string) || "English";
    const question = (form.get("question") as string) || "";
    const maxPagesStr = (form.get("maxPages") as string) || "";
    const maxPages = Math.max(1, Math.min(parseInt(maxPagesStr || "5", 10) || 5, 10));
    const file = form.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = (file as unknown as { name?: string }).name || "upload";
    const contentType = file.type || "application/octet-stream";

    let extracted = "";

    if (contentType.includes("application/pdf") || filename.toLowerCase().endsWith(".pdf")) {
      extracted = await extractPdfText(buffer);
    } else if (contentType.startsWith("image/")) {
      // Vision OCR then optional summarize/translate
      const data64 = `data:${contentType};base64,${buffer.toString("base64")}`;
      const resp = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Extract all readable text from this image. Return plain text only." },
          { role: "user", content: [ { type: "image_url", image_url: { url: data64, detail: "high" } } ] },
        ],
      });
      extracted = resp.choices?.[0]?.message?.content || "";
    } else if (contentType.startsWith("text/")) {
      extracted = buffer.toString("utf8");
    } else {
      // Fallback: try to read as UTF-8; if binary, bail out
      try {
        extracted = buffer.toString("utf8");
      } catch {
        extracted = "";
      }
    }

    if (!extracted.trim()) {
      return Response.json({ error: "Could not read any text from the attachment." }, { status: 400 });
    }

    // Execute the requested mode
    if (mode === "translate") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: `Translate the provided document text into ${targetLanguage}. Return only the translation.` },
          { role: "user", content: extracted.slice(0, 15000) },
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
          { role: "system", content: "Summarize the document in bullet points (concise, factual)." },
          { role: "user", content: extracted.slice(0, 15000) },
        ],
      });
      const content = completion.choices?.[0]?.message?.content || "";
      return Response.json({ content });
    }

    // chat (QA) about the attachment
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Answer the user's question using only the provided document text. If not enough info, say what is missing succinctly." },
        { role: "user", content: `Document text:\n\n${extracted.slice(0, 15000)}\n\nQuestion: ${question || "Explain this document."}` },
      ],
    });
    const content = completion.choices?.[0]?.message?.content || "";
    return Response.json({ content });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

