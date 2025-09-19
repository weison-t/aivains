"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ClaimRow = {
  id: string;
  created_at: string;
  full_name: string | null;
  policy_no: string | null;
  passport_no: string | null;
  email: string | null;
  phone: string | null;
  claim_types: string | null;
  other_claim_detail: string | null;
  destination_country: string | null;
  departure_date: string | null;
  return_date: string | null;
  airline: string | null;
  incident_datetime: string | null;
  incident_location: string | null;
  incident_description: string | null;
  bank_name: string | null;
  account_no: string | null;
  account_name: string | null;
  declaration: boolean | null;
  signature_date: string | null;
  passport_copy_paths: string[] | null;
  medical_receipts_paths: string[] | null;
  police_report_path: string | null;
  other_docs_paths: string[] | null;
};

export default function SubmittedClaimsPage() {
  const [rows, setRows] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !anon) { setError("Supabase not configured."); setLoading(false); return; }
    const supa = createClient(url, anon);
    (async () => {
      try {
        const { data, error: err } = await supa
          .from("tarvelclaimform")
          .select("id,created_at,full_name,policy_no,passport_no,email,phone,claim_types,other_claim_detail,destination_country,departure_date,return_date,airline,incident_datetime,incident_location,incident_description,bank_name,account_no,account_name,declaration,signature_date,passport_copy_paths,medical_receipts_paths,police_report_path,other_docs_paths")
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

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => (
      `${r.full_name || ""} ${r.policy_no || ""} ${r.email || ""}`.toLowerCase().includes(q)
    ));
  }, [rows, query]);

  const fmtDate = (s: string | null) => {
    if (!s) return "-";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth()+1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Submitted Claims</h1>
        <p className="mt-2 opacity-90">Preview submitted claim info and attachments.</p>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, policy, or email"
            aria-label="Search submitted claims"
            className="w-full max-w-sm rounded-lg bg-white/10 placeholder-white/60 px-3 py-2 ring-1 ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          />
        </div>

        {loading && <p className="mt-6 opacity-80">Loading…</p>}
        {error && <p className="mt-6 text-red-300">Error: {error}</p>}

        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.length === 0 && (
              <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 p-4">No claims submitted yet.</div>
            )}
            {filtered.map((row) => (
              <article key={row.id} className="rounded-2xl bg-white text-black ring-1 ring-black/10 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">{row.full_name || "Unnamed"}</h2>
                    <p className="text-xs text-black/70">Policy: {row.policy_no || "-"}</p>
                  </div>
                  <span className="text-xs text-black/60">{fmtDate(row.created_at)}</span>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <section className="space-y-1">
                    <h3 className="font-semibold">Contacts</h3>
                    <p><span className="text-black/60">Email:</span> {row.email || "-"}</p>
                    <p><span className="text-black/60">Phone:</span> {row.phone || "-"}</p>
                    <p><span className="text-black/60">Passport:</span> {row.passport_no || "-"}</p>
                  </section>
                  <section className="space-y-1">
                    <h3 className="font-semibold">Travel</h3>
                    <p><span className="text-black/60">Destination:</span> {row.destination_country || "-"}</p>
                    <p><span className="text-black/60">Departure:</span> {fmtDate(row.departure_date)}</p>
                    <p><span className="text-black/60">Return:</span> {fmtDate(row.return_date)}</p>
                    <p><span className="text-black/60">Airline:</span> {row.airline || "-"}</p>
                  </section>
                  <section className="space-y-1">
                    <h3 className="font-semibold">Claim</h3>
                    <p><span className="text-black/60">Types:</span> {row.claim_types || "-"}</p>
                    <p><span className="text-black/60">Other:</span> {row.other_claim_detail || "-"}</p>
                  </section>
                  <section className="space-y-1">
                    <h3 className="font-semibold">Incident</h3>
                    <p><span className="text-black/60">When:</span> {fmtDate(row.incident_datetime)}</p>
                    <p><span className="text-black/60">Where:</span> {row.incident_location || "-"}</p>
                    <div>
                      <p className="text-black/60">Description:</p>
                      <p className="mt-1 whitespace-pre-wrap">{row.incident_description || "-"}</p>
                    </div>
                  </section>
                  <section className="space-y-1 sm:col-span-2">
                    <h3 className="font-semibold">Bank</h3>
                    <p><span className="text-black/60">Bank:</span> {row.bank_name || "-"}</p>
                    <p><span className="text-black/60">Account No.:</span> {row.account_no || "-"}</p>
                    <p><span className="text-black/60">Account Name:</span> {row.account_name || "-"}</p>
                    <p><span className="text-black/60">Declaration:</span> {row.declaration ? "Yes" : "No"}</p>
                    <p><span className="text-black/60">Signature Date:</span> {fmtDate(row.signature_date)}</p>
                  </section>
                </div>
                <div className="mt-4 border-t border-black/10 pt-3">
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <AttachmentGroup title="Passport" paths={row.passport_copy_paths} />
                    <AttachmentGroup title="Receipts" paths={row.medical_receipts_paths} />
                    {row.police_report_path && <AttachmentGroup title="Police Report" paths={[row.police_report_path]} />}
                    <AttachmentGroup title="Other" paths={row.other_docs_paths} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AttachmentGroup({ title, paths }: { title: string; paths: string[] | null | undefined }) {
  if (!paths || paths.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-1 space-y-1 text-sm text-black/80">
        {paths.map((p) => (
          <li key={`${title}-${p}`} className="truncate" title={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

