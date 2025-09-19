import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const data: Record<string, string> = {};
    formData.forEach((v, k) => {
      if (typeof v === "string") data[k] = v;
    });

    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    if (!supaUrl || !serviceKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }

    const supabase = createClient(supaUrl, serviceKey);

    // Ensure bucket exists (idempotent)
    const bucket = "travel-claims";
    await supabase.storage.createBucket(bucket, { public: false }).catch(() => undefined);

    // Create a record id first (client-side UUID not provided; we'll generate via RPC or use JS)
    const recordId = crypto.randomUUID();

    // Upload file helpers
    const uploadOne = async (key: string, file: File): Promise<string> => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = `${Date.now()}_${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = `${recordId}/${key}/${safeName}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (upErr) throw upErr;
      return objectPath;
    };

    const passportCopyPaths: string[] = [];
    const medicalReceiptsPaths: string[] = [];
    const otherDocsPaths: string[] = [];
    let policeReportPath: string | null = null;
    let signatureFilePath: string | null = null;

    // Iterate entries again to upload files
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key === "passportCopy") {
          passportCopyPaths.push(await uploadOne(key, value));
        } else if (key === "medicalReceipts") {
          medicalReceiptsPaths.push(await uploadOne(key, value));
        } else if (key === "policeReport") {
          policeReportPath = await uploadOne(key, value);
        } else if (key === "otherDocs") {
          otherDocsPaths.push(await uploadOne(key, value));
        } else if (key === "signatureFile") {
          signatureFilePath = await uploadOne(key, value);
        }
      }
    }

    // Insert row into public.tarvelclaimform
    const { error: insErr } = await supabase.from("tarvelclaimform").insert({
      id: recordId,
      full_name: data.fullName || null,
      policy_no: data.policyNo || null,
      passport_no: data.passportNo || null,
      destination_country: data.destinationCountry || null,
      phone: data.phone || null,
      email: data.email || null,
      departure_date: data.departureDate || null,
      return_date: data.returnDate || null,
      airline: data.airline || null,
      claim_types: data.claimTypes || null,
      other_claim_detail: data.otherClaimDetail || null,
      incident_datetime: data.incidentDateTime || null,
      incident_location: data.incidentLocation || null,
      incident_description: data.incidentDescription || null,
      bank_name: data.bankName || null,
      account_no: data.accountNo || null,
      account_name: data.accountName || null,
      declaration: data.declaration ? true : false,
      signature_date: data.signatureDate || null,
      passport_copy_paths: passportCopyPaths,
      medical_receipts_paths: medicalReceiptsPaths,
      police_report_path: policeReportPath,
      other_docs_paths: otherDocsPaths,
      signature_file_path: signatureFilePath,
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: recordId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

