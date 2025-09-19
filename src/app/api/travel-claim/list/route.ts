import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }
    const supa = createClient(url, serviceKey);
    const { data, error } = await supa
      .from("tarvelclaimform")
      .select(
        "id,created_at,full_name,policy_no,passport_no,email,phone,claim_types,other_claim_detail,destination_country,departure_date,return_date,airline,incident_datetime,incident_location,incident_description,bank_name,account_no,account_name,declaration,signature_date,passport_copy_paths,medical_receipts_paths,police_report_path,other_docs_paths"
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ rows: data || [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

