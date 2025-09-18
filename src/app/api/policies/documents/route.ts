import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 500 }
    );
  }

  const supa = createClient(url, serviceKey);

  try {
    const { data: list, error: listErr } = await supa.storage
      .from("policies")
      .list(undefined, {
        limit: 1000,
        sortBy: { column: "updated_at", order: "desc" },
      });
    if (listErr) throw listErr;

    const files = await Promise.all(
      (list || []).map(async (f: any) => {
        const path = f.name as string;
        // Signed URL (default 1 hour)
        const { data: signed, error: signErr } = await supa.storage
          .from("policies")
          .createSignedUrl(path, 3600);
        if (signErr) throw signErr;
        return {
          name: f.name as string,
          path,
          updatedAt: (f as { updated_at?: string }).updated_at,
          size: (f as { metadata?: { size?: number } }).metadata?.size,
          url: signed?.signedUrl as string | undefined,
        };
      })
    );

    return NextResponse.json({ files });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to list documents" },
      { status: 500 }
    );
  }
}

