import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BucketFile = {
  name: string;
  updated_at?: string;
  metadata?: { size?: number };
};

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !serviceKey) {
    // Graceful fallback to avoid breaking builds or local runs without server key
    return NextResponse.json({ files: [] });
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
      (list || []).map(async (f: BucketFile) => {
        const path = f.name as string;
        // Signed URL (default 1 hour)
        const { data: signed, error: signErr } = await supa.storage
          .from("policies")
          .createSignedUrl(path, 3600);
        if (signErr) throw signErr;
        return {
          name: f.name as string,
          path,
          updatedAt: f.updated_at,
          size: f.metadata?.size,
          url: signed?.signedUrl as string | undefined,
        };
      })
    );

    return NextResponse.json({ files });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list documents";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

