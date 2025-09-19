"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ClaimRow = {
  id: string;
  created_at: string;
  full_name: string | null;
  policy_no: string | null;
  email: string | null;
  claim_types: string | null;
  destination_country: string | null;
  incident_datetime: string | null;
  incident_location: string | null;
  passport_copy_paths: string[] | null;
  medical_receipts_paths: string[] | null;
  police_report_path: string | null;
  other_docs_paths: string[] | null;
};

export default function SubmittedClaimsPage() {
  const [rows, setRows] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !anon) { setError("Supabase not configured."); setLoading(false); return; }
    const supa = createClient(url, anon);
    (async () => {
      try {
        const { data, error: err } = await supa
          .from("tarvelclaimform")
          .select("id,created_at,full_name,policy_no,email,claim_types,destination_country,incident_datetime,incident_location,passport_copy_paths,medical_receipts_paths,police_report_path,other_docs_paths")
          .order("created_at", { ascending: false });
        if (err) throw err;
        setRows(Array.isArray(data) ? (data as unknown as ClaimRow[]) : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Submitted Claims</h1>
        <p className="mt-2 opacity-90">Preview submitted claim info and attachments.</p>

        {loading && <p className="mt-6 opacity-80">Loading…</p>}
        {error && <p className="mt-6 text-red-300">Error: {error}</p>}

        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.length === 0 && (
              <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 p-4">No claims submitted yet.</div>
            )}
            {rows.map((row) => (
              <article key={row.id} className="rounded-2xl bg-white text-black ring-1 ring-black/10 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">{row.full_name || "Unnamed"}</h2>
                    <p className="text-xs text-black/70">Policy: {row.policy_no || "-"}</p>
                  </div>
                  <span className="text-xs text-black/60">{new Date(row.created_at).toLocaleString()}</span>
                </div>
                <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-black/60">Email</dt>
                    <dd>{row.email || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Claim Types</dt>
                    <dd>{row.claim_types || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Destination</dt>
                    <dd>{row.destination_country || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Incident</dt>
                    <dd>{row.incident_datetime ? new Date(row.incident_datetime).toLocaleString() : "-"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-black/60">Location</dt>
                    <dd>{row.incident_location || "-"}</dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  <ul className="mt-1 text-sm list-disc pl-5 text-black/80 space-y-1">
                    {row.passport_copy_paths?.map((p) => (<li key={p}>Passport: {p}</li>))}
                    {row.medical_receipts_paths?.map((p) => (<li key={p}>Receipt: {p}</li>))}
                    {row.police_report_path && (<li>Police report: {row.police_report_path}</li>)}
                    {row.other_docs_paths?.map((p) => (<li key={p}>Other: {p}</li>))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

