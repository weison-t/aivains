import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const TABLE = "chathistory";
const ROW_ID = "default"; // single-history storage

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

export async function GET(): Promise<Response> {
  try {
    const supa = getServiceClient();
    const { data, error } = await supa
      .from(TABLE)
      .select("messages")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ messages: (data?.messages as ChatMessage[]) || [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ messages: [], error: message }, { status: 200 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { messages: ChatMessage[] };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const supa = getServiceClient();
    const { error } = await supa.from(TABLE).upsert({ id: ROW_ID, messages }, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

