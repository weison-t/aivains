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
    const hasVectorStores = Boolean((openai as any)?.beta?.vectorStores?.create);
    if (!hasVectorStores) {
      return Response.json(
        { error: "Retrieval not available in this environment (vector stores unsupported)." },
        { status: 501 }
      );
    }

    // Create vector store and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const vf = await (OpenAI as any).toFile(buffer, (file as any).name || "upload.pdf", { contentType: file.type || "application/pdf" });

    const vectorStore = await (openai as any).beta.vectorStores.create({ name: `aiva-retrieve-${Date.now()}` });
    await (openai as any).beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files: [vf] });

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
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } } as any,
      input: question ? `${instruction}\n\nQuestion: ${question}` : instruction,
    } as any);

    const anyResp: any = response as any;
    const outputText: string = anyResp.output_text
      || (Array.isArray(anyResp.output)
        ? anyResp.output.map((o: any) => Array.isArray(o?.content) ? o.content.map((c: any) => c?.text?.value || "").join("") : "").join("\n")
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

