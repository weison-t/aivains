import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
// Server-side pdf.js usage removed for Vercel Turbopack compatibility

export const runtime = "nodejs";

type TranslateRequest = {
  url: string;
  targetLanguage: "English" | "中文" | "ไทย" | "Bahasa Melayu";
  filename?: string;
  storagePath?: string; // path within policies bucket
  maxPages?: number; // optional limit for OCR pages
};

// Lazy initialize inside handler to avoid build-time env requirement

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default as (b: Buffer) => Promise<{ text: string }>;
    const result = await pdfParse(buffer);
    if (result.text && result.text.trim().length > 0) return result.text;
  } catch {
    // ignore and fall through
  }
  // No server-side pdfjs fallback to avoid module resolution issues on Vercel
  return "";
}

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const body = (await req.json()) as TranslateRequest;
    const { url, targetLanguage, filename, storagePath } = body || {};
    if (!targetLanguage) {
      return Response.json({ error: "Missing targetLanguage" }, { status: 400 });
    }

    let effectiveUrl = url;
    let effectiveFilename = filename;

    if (storagePath) {
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
      if (!supaUrl || !serviceKey) {
        return Response.json({ error: "Supabase configuration missing" }, { status: 500 });
      }
      const supa = createClient(supaUrl, serviceKey);
      // Create a short-lived signed URL for the storage object to download reliably
      const { data: signed, error: signErr } = await supa.storage
        .from("policies")
        .createSignedUrl(storagePath, 600);
      if (signErr || !signed?.signedUrl) {
        return Response.json({ error: "Failed to sign storage path" }, { status: 400 });
      }
      effectiveUrl = signed.signedUrl;
      effectiveFilename = storagePath.split("/").pop() || filename;
    }

    if (!effectiveUrl) {
      return Response.json({ error: "Missing url or storagePath" }, { status: 400 });
    }

    const res = await fetch(effectiveUrl, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: `Failed to fetch document (${res.status})` }, { status: 400 });
    }
    const contentType = res.headers.get("content-type") || "";
    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    let sourceText = "";
    let usedVision = false;

    if (contentType.includes("application/pdf") || (effectiveFilename || "").toLowerCase().endsWith(".pdf")) {
      sourceText = await extractPdfText(buffer);
    } else if (contentType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((e) => (effectiveFilename || effectiveUrl).toLowerCase().endsWith(e))) {
      usedVision = true;
    } else if (contentType.startsWith("text/")) {
      sourceText = buffer.toString("utf8");
    }

    let translated = "";

    if (usedVision) {
      // Use Vision to read and translate the image content
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Extract readable text from the image and translate it into ${targetLanguage}. Keep structure and headings when possible. Return only the translation.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Translate this image to the target language." },
              { type: "image_url", image_url: { url: effectiveUrl } },
            ],
          },
        ],
      });
      translated = completion.choices?.[0]?.message?.content || "";
    } else {
      if (sourceText) {
        // Chunk long documents to ensure reliable translations
        const chunks: string[] = [];
        const maxChunk = 6000; // chars
        if (sourceText.length <= maxChunk) {
          chunks.push(sourceText);
        } else {
          const paragraphs = sourceText.split(/\n\s*\n/);
          let current = "";
          for (const para of paragraphs) {
            if ((current + "\n\n" + para).length > maxChunk && current) {
              chunks.push(current);
              current = para;
            } else {
              current = current ? current + "\n\n" + para : para;
            }
          }
          if (current) chunks.push(current);
        }

        const outputs: string[] = [];
        for (let i = 0; i < chunks.length; i += 1) {
          const part = chunks[i];
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: `You are a translation assistant. Translate the provided document text into ${targetLanguage}. Preserve section breaks and lists as readable plain text. Do not add commentary; output only the translation.`,
              },
              { role: "user", content: part },
            ],
          });
          outputs.push(completion.choices?.[0]?.message?.content || "");
        }
        translated = outputs.filter(Boolean).join("\n\n");
      } else {
        // No extractable text; let client-side OCR fallback handle scanned PDFs
        translated = "";
      }
    }

    if (!translated || translated.trim().length === 0) {
      return Response.json({ error: "No extractable text from document. Try increasing maxPages or use client OCR fallback." }, { status: 400 });
    }
    return Response.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

