import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type TranslateFileRequest = {
  storagePath?: string;
  url?: string;
  targetLanguage: "English" | "中文" | "ไทย" | "Bahasa Melayu";
  filename?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey });

    const body = (await req.json()) as TranslateFileRequest;
    const { storagePath, url, targetLanguage, filename } = body || {};
    if (!targetLanguage) {
      return Response.json({ error: "Missing targetLanguage" }, { status: 400 });
    }

    let effectiveUrl = url || "";
    let effectiveFilename = filename || "document.pdf";

    if (storagePath) {
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
      if (!supaUrl || !serviceKey) {
        return Response.json({ error: "Supabase configuration missing" }, { status: 500 });
      }
      const supa = createClient(supaUrl, serviceKey);
      const { data: signed, error: signErr } = await supa.storage
        .from("policies")
        .createSignedUrl(storagePath, 600);
      if (signErr || !signed?.signedUrl) {
        return Response.json({ error: "Failed to sign storage path" }, { status: 400 });
      }
      effectiveUrl = signed.signedUrl;
      effectiveFilename = storagePath.split("/").pop() || effectiveFilename;
    }

    if (!effectiveUrl) {
      return Response.json({ error: "Missing url or storagePath" }, { status: 400 });
    }

    const res = await fetch(effectiveUrl, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: `Failed to fetch document (${res.status})` }, { status: 400 });
    }
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await res.arrayBuffer());

    // Create a Vector Store and upload the file (ChatGPT attachments-like)
    const vf = await (OpenAI as unknown as { toFile: (buf: Buffer, name: string, opts: { contentType: string }) => Promise<File> }).toFile(
      buffer,
      effectiveFilename,
      { contentType }
    );
    const vectorStore = await (openai as unknown as { beta: { vectorStores: { create: (a: { name: string }) => Promise<{ id: string }>; fileBatches: { uploadAndPoll: (id: string, opts: { files: File[] }) => Promise<unknown> } } } }).beta.vectorStores.create({ name: `aiva-translate-${Date.now()}` });
    await (openai as unknown as { beta: { vectorStores: { fileBatches: { uploadAndPoll: (id: string, opts: { files: File[] }) => Promise<unknown> } } } }).beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: [vf] });

    // Use file_search tool with the vector store
    const response = await (openai as unknown as {
      responses: { create: (opts: {
        model: string;
        tools: Array<{ type: "file_search"; file_search?: { vector_store_ids: string[] } }>;
        tool_resources: { file_search: { vector_store_ids: string[] } };
        input: string;
      }) => Promise<unknown> };
    }).responses.create({
      model: "gpt-4.1-mini",
      tools: [{ type: "file_search", file_search: { vector_store_ids: [vectorStore.id] } }],
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      input: `Translate the attached document into ${targetLanguage}. Preserve structure and headings as readable plain text. Return only the translation.`,
    });

    // Extract text
    // Some SDK versions expose response.output_text; otherwise assemble from output array
    const resp = response as unknown as { output_text?: string; output?: Array<{ content?: Array<{ text?: { value?: string } }> }>; };
    const outputText: string = resp.output_text
      || (Array.isArray(resp.output)
        ? resp.output
            .map((o) => Array.isArray(o?.content) ? o.content.map((c) => c?.text?.value || "").join("") : "")
            .join("\n")
        : "");

    if (!outputText || outputText.trim().length === 0) {
      return Response.json({ error: "Translation failed to produce output." }, { status: 500 });
    }

    return Response.json({ translated: outputText });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

