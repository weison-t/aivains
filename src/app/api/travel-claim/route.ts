import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const data: Record<string, string> = {};
    formData.forEach((v, k) => {
      if (typeof v === "string") data[k] = v;
    });

    const files: Record<string, string[]> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const list = files[key] || [];
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}_${value.name}`;
        const filepath = path.join("/tmp", filename);
        await writeFile(filepath, buffer);
        list.push(filepath);
        files[key] = list;
      }
    }

    return NextResponse.json({ ok: true, data, files });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

