import OpenAI from "openai";
import { createCanvas } from "canvas";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

export const runtime = "nodejs";

type Mode = "chat" | "summarize" | "translate";

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: unknown) => { promise: Promise<PdfJsDocument> };
};
type PdfJsDocument = { numPages: number; getPage: (n: number) => Promise<PdfJsPage> };
type PdfJsPage = {
  getTextContent: () => Promise<{ items: Array<{ str?: unknown }> }>;
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (args: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
};

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const parsePdf = (await import("pdf-parse")).default as (b: Buffer) => Promise<{ text: string }>;
    const res = await parsePdf(buffer);
    if (res.text && res.text.trim()) return res.text.trim();
  } catch {}
  try {
    const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.js")) as unknown as PdfJsModule;
    pdfjs.GlobalWorkerOptions.workerSrc = null as unknown as string;
    const doc = await pdfjs.getDocument({ data: buffer, disableFontFace: true, isEvalSupported: false }).promise;
    const texts: string[] = [];
    const limit = Math.min(doc.numPages || 1, 20);
    for (let i = 1; i <= limit; i += 1) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      const items = (tc && Array.isArray((tc as { items?: unknown }).items)) ? (tc as { items: Array<{ str?: unknown }> }).items : [];
      const pageStr = items.map((it) => (typeof it.str === "string" ? it.str : "")).join(" ");
      if (pageStr.trim()) texts.push(pageStr);
    }
    return texts.join("\n\n").trim();
  } catch {}
  return "";
}

async function ocrPdfToText(buffer: Buffer, openai: OpenAI, maxPages = 8): Promise<string> {
  try {
    const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.js")) as unknown as PdfJsModule;
    pdfjs.GlobalWorkerOptions.workerSrc = null as unknown as string;
    const doc = await pdfjs.getDocument({ data: buffer, disableFontFace: true, isEvalSupported: false }).promise;
    const total = doc.numPages || 1;
    const limit = Math.max(1, Math.min(maxPages, total));
    const pageTexts: string[] = [];
    for (let i = 1; i <= limit; i += 1) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const content: ChatCompletionMessageParam["content"] = [
        { type: "text", text: `Extract page ${i} text.` },
        { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
      ];
      const res = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Extract all readable text from this image. Return plain text." },
          { role: "user", content },
        ],
      });
      const pageOut = res.choices?.[0]?.message?.content || "";
      if (pageOut.trim()) pageTexts.push(pageOut.trim());
    }
    return pageTexts.join("\n\n").trim();
  } catch {
    return "";
  }
}

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
      if (!extracted.trim()) {
        extracted = await ocrPdfToText(buffer, openai, maxPages);
      }
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

