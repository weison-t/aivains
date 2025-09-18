import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY on server." }, { status: 500 });
    const openai = new OpenAI({ apiKey });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const mode = (form.get("mode") as string) || "translate"; // translate | summarize | chat
    const targetLang = (form.get("targetLang") as string) || "English";
    const question = (form.get("question") as string) || "";

    if (!file) return Response.json({ error: "No file provided." }, { status: 400 });

    // Ensure vector store API is available
    const hasVectorStores = Boolean((openai as unknown as { beta?: { vectorStores?: unknown } }).beta?.vectorStores);
    if (!hasVectorStores) {
      return Response.json(
        { error: "Retrieval not available in this environment (vector stores unsupported)." },
        { status: 501 }
      );
    }

    // Create vector store and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const vf = await (OpenAI as unknown as { toFile: (buf: Buffer, name: string, opts: { contentType: string }) => Promise<File> }).toFile(
      buffer,
      ((file as unknown as { name?: string }).name || "upload.pdf"),
      { contentType: file.type || "application/pdf" }
    );

    const vectorStore = await (openai as unknown as { beta: { vectorStores: { create: (a: { name: string }) => Promise<{ id: string }> } } }).beta.vectorStores.create({ name: `aiva-retrieve-${Date.now()}` });
    await (openai as unknown as { beta: { vectorStores: { fileBatches: { uploadAndPoll: (id: string, opts: { files: File[] }) => Promise<unknown> } } } }).beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: [vf] });

    // Build instruction
    let instruction = "";
    if (mode === "translate") {
      instruction = `Translate the attached document into ${targetLang}. Preserve structure and headings as plain text.`;
    } else if (mode === "summarize") {
      instruction = `Summarize the attached document in concise bullet points.`;
    } else {
      instruction = `Answer the user's question using only the attached document. If insufficient, state what's missing.`;
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      tools: [{ type: "file_search" }],
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      input: question ? `${instruction}\n\nQuestion: ${question}` : instruction,
    });

    const resp = response as unknown as { output_text?: string; output?: Array<{ content?: Array<{ text?: { value?: string } }> }>; };
    const outputText: string = resp.output_text
      || (Array.isArray(resp.output)
        ? resp.output.map((o) => Array.isArray(o?.content) ? o.content.map((c) => c?.text?.value || "").join("") : "").join("\n")
        : "");

    if (!outputText || outputText.trim().length === 0) {
      return Response.json({ error: "No output from retrieval." }, { status: 500 });
    }

    return Response.json({ content: outputText });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

