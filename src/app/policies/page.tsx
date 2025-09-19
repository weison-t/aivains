"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";

type PolicyStatus = "Active" | "Expired";
type PolicyType = "Health" | "Motor" | "Property" | "Life";

type Policy = {
  id: string;
  name: string;
  number: string;
  type: PolicyType;
  status: PolicyStatus;
  coverage: string; // e.g., "RM 250,000"
  deductible: string; // e.g., "RM 500" or "Excess RM 300"
  renewalISO: string; // YYYY-MM-DD
  details?: string;
};

const seedPolicies: Policy[] = [
  {
    id: "p-health-1",
    name: "Comprehensive Health",
    number: "HL-9321-AB",
    type: "Health",
    status: "Active",
    coverage: "RM 250,000",
    deductible: "RM 500",
    renewalISO: "2025-12-12",
    details: "Inpatient, outpatient specialist, diagnostics, and emergency coverage.",
  },
  {
    id: "p-motor-1",
    name: "Motor Insurance",
    number: "MC-5582-ZX",
    type: "Motor",
    status: "Active",
    coverage: "RM 80,000",
    deductible: "Excess RM 300",
    renewalISO: "2026-07-28",
    details: "Comprehensive cover including third-party liability and windscreen add-on.",
  },
];

type StorageFile = {
  name: string;
  path: string;
  updatedAt?: string;
  size?: number;
  url?: string;
};

const formatDateDisplay = (iso: string) => {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | PolicyType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | PolicyStatus>("All");
  const [expandedId, setExpandedId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"documents" | "policies">("documents");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [translated, setTranslated] = useState<string>("");
  const [translating, setTranslating] = useState<boolean>(false);

  // Add policy feature removed per request

  useEffect(() => {
    const SUPA_READY = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (SUPA_READY) {
          // Use signed URL API to support private buckets
          try {
            const res = await fetch("/api/policies/documents", { cache: "no-store" });
            if (res.ok) {
              const json = (await res.json()) as { files: StorageFile[] };
              if (Array.isArray(json.files)) setFiles(json.files);
            }
          } catch {}

          const supabase = getSupabaseClient();
          const { data, error: err } = await supabase
            .from("policies")
            .select("id,name,number,type,status,coverage,deductible,renewalISO,details")
            .order("name", { ascending: true });
          if (!err && Array.isArray(data) && data.length > 0) {
            setPolicies(data as unknown as Policy[]);
          }
        }
        // Fallback to localStorage or seeds
        const saved = localStorage.getItem("aiva_policies");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Policy[];
            setPolicies(parsed.length ? parsed : seedPolicies);
          } catch {
            setPolicies(seedPolicies);
          }
        } else {
          setPolicies(seedPolicies);
        }
      } catch {
        setError("Failed to load policies. Showing sample data.");
        setPolicies(seedPolicies);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Keep a local cache for offline use
    localStorage.setItem("aiva_policies", JSON.stringify(policies));
  }, [policies]);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchesQuery = `${p.name} ${p.number}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "All" ? true : p.type === typeFilter;
      const matchesStatus = statusFilter === "All" ? true : p.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [policies, query, typeFilter, statusFilter]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied");
    } catch {
      /* ignore */
    }
  };

  // handleAddPolicy removed

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this policy?")) return;
    const SUPA_READY = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    if (SUPA_READY) {
      const supabase = getSupabaseClient();
      const { error: err } = await supabase.from("policies").delete().eq("id", id);
      if (err) {
        alert("Failed to delete on server. Removing locally only.");
      }
    }
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDownloadCard = (p: Policy) => {
    const content = `Policy: ${p.name}\nNumber: ${p.number}\nType: ${p.type}\nStatus: ${p.status}\nCoverage: ${p.coverage}\nDeductible: ${p.deductible}\nRenewal: ${formatDateDisplay(p.renewalISO)}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.number}-ecard.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRenewalICS = (p: Policy) => {
    if (!p.renewalISO) return;
    const [y, m, d] = p.renewalISO.split("-").map((n) => parseInt(n, 10));
    const start = new Date(y, (m || 1) - 1, d || 1, 9, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (dt: Date) => `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}00`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AIVA//Policies//EN\nBEGIN:VEVENT\nUID:${p.id}@aiva\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:Policy Renewal Reminder\nDESCRIPTION:${p.name} (${p.number}) renewal\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renewal-${p.number}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Policies</h1>
          <div className="inline-flex rounded-lg bg-white/10 p-1 text-xs">
            <button
              onClick={() => setView("documents")}
              className={`px-2 py-1 rounded-md ${view === "documents" ? "bg-white text-fuchsia-700" : "hover:bg-white/20"}`}
              aria-pressed={view === "documents"}
            >
              Documents
            </button>
            <button
              onClick={() => setView("policies")}
              className={`px-2 py-1 rounded-md ${view === "policies" ? "bg-white text-fuchsia-700" : "hover:bg-white/20"}`}
              aria-pressed={view === "policies"}
            >
              Summary
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-xs opacity-80">Loading policies…</p>
        )}
        {!loading && error && (
          <p className="text-xs opacity-80">{error}</p>
        )}

        {/* Mobile-friendly filters */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === "documents" ? "Search documents" : "Search policies"}
              className="flex-1 rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={view === "documents" ? "Search documents" : "Search policies"}
            />
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="rounded-md bg-white text-fuchsia-700 font-semibold px-3 py-2 text-sm"
              aria-expanded={showFilters}
              aria-controls="mobile-filters"
            >
              Filters
            </button>
          </div>
          {(view === "documents" && query) || (view === "policies" && (query || typeFilter !== "All" || statusFilter !== "All")) ? (
            <div className="flex flex-wrap items-center gap-2">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]"
                  aria-label="Clear search"
                >
                  <span>Search: &quot;{query}&quot;</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {view === "policies" && typeFilter !== "All" && (
                <button
                  onClick={() => setTypeFilter("All")}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]"
                  aria-label="Clear type filter"
                >
                  <span>Type: {typeFilter}</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {view === "policies" && statusFilter !== "All" && (
                <button
                  onClick={() => setStatusFilter("All")}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]"
                  aria-label="Clear status filter"
                >
                  <span>Status: {statusFilter}</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              <button
                onClick={() => {
                  setQuery("");
                  if (view === "policies") {
                    setTypeFilter("All");
                    setStatusFilter("All");
                  }
                }}
                className="ml-auto rounded-md bg-white/10 hover:bg-white/15 px-2 py-1 text-[11px]"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            </div>
          ) : null}
          {showFilters && (
            <div id="mobile-filters" className="rounded-2xl border border-white/20 bg-white/10 p-3 space-y-2">
              <div>
                <label className="block text-xs mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as PolicyType | "All")}
                  className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="Filter by type"
                >
                  <option>All</option>
                  <option>Health</option>
                  <option>Motor</option>
                  <option>Property</option>
                  <option>Life</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | "All")}
                  className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="Filter by status"
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Expired</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Desktop filters */}
        <div className="hidden md:grid grid-cols-3 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={view === "documents" ? "Search documents" : "Search by name or number"}
            className="rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Search policies"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PolicyType | "All")}
            className="rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Filter by type"
          >
            <option>All</option>
            <option>Health</option>
            <option>Motor</option>
            <option>Property</option>
            <option>Life</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | "All")}
            className="rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Active</option>
            <option>Expired</option>
          </select>
        </div>

        {/* Add policy feature removed */}

        {view === "documents" ? (
          <p className="text-xs opacity-80">{files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())).length} document(s)</p>
        ) : (
          <p className="text-xs opacity-80">{filtered.length} policy{filtered.length === 1 ? "" : "ies"} shown</p>
        )}

        {view === "documents" ? (
          <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files
              .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
              .map((f) => (
                <div
                  key={f.path}
                  className="rounded-2xl border border-white/30 bg-white/10 p-3 shadow-sm flex items-center gap-3"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white flex-none">
                    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 3.5V8h4.5"/>
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" title={f.name}>{f.name}</p>
                    <p className="text-[11px] opacity-75">
                      {f.updatedAt ? formatDateDisplay(f.updatedAt) : ""}
                      {f.size ? ` • ${Math.round((f.size / 1024) * 10) / 10} KB` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {f.url ? (
                      <button onClick={() => setSelectedFile(f)} className="rounded-md bg-white text-fuchsia-700 px-2 py-1">Open</button>
                    ) : (
                      <button disabled className="rounded-md bg-white/20 px-2 py-1 opacity-60">Open</button>
                    )}
                    {f.url && (
                      <a href={f.url} download className="rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">Download</a>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {selectedFile && (
            <div className="mt-3 rounded-2xl border border-white/30 bg-white/10 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate" title={selectedFile.name}>{selectedFile.name}</p>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:inline text-[11px] opacity-80">Translate:</div>
                  {(["English","中文","ไทย","Bahasa Melayu"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={async () => {
                        if (!selectedFile?.url) return;
                        setTranslating(true);
                        setTranslated("");
                        try {
                          const lower = (selectedFile.name || "").toLowerCase();
                          const isPdf = lower.endsWith(".pdf");
                          const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) => lower.endsWith(ext));
                          if (isPdf || isImage) {
                            // Attempt server-side translation first (PDF text or OCR)
                            let serverTranslated = "";
                            try {
                              const res = await fetch("/api/translate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ url: selectedFile.url, filename: selectedFile.name, targetLanguage: lang, storagePath: selectedFile.path, maxPages: 8 }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (res.ok && data?.translated) {
                                serverTranslated = data.translated as string;
                                setTranslated(serverTranslated);
                                return;
                              }
                            } catch {}

                            if (isPdf) {
                              // Client-side pdf.js fallback removed for deploy stability. Show a helpful message.
                              setTranslated("No extractable text from PDF on server. Please download and upload to AI page for OCR translation.");
                            } else {
                              setTranslated("Translation failed.");
                            }
                          } else {
                            // For text-like files or fallback, fetch text via fetch and send to translate-text
                            const raw = await fetch(selectedFile.url as string);
                            const text = await raw.text();
                            const res = await fetch("/api/translate-text", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text, targetLanguage: lang }),
                            });
                            const data = await res.json();
                            if (data?.translated) setTranslated(data.translated);
                          }
                        } catch {
                          setTranslated("Translation failed. Please try again.");
                        } finally {
                          setTranslating(false);
                        }
                      }}
                      className="text-xs rounded-md bg-white/20 hover:bg-white/25 px-2 py-1"
                      aria-label={`Translate to ${lang}`}
                    >{lang}</button>
                  ))}
                  <button onClick={() => { setSelectedFile(null); setTranslated(""); }} className="text-xs rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">Close</button>
                </div>
              </div>
              <div className="mt-2 rounded-lg overflow-hidden bg-white">
                {(() => {
                  const url = selectedFile.url || "";
                  const lower = (selectedFile.name || "").toLowerCase();
                  const isPdf = lower.endsWith(".pdf");
                  const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) => lower.endsWith(ext));
                  if (isPdf) {
                    return (
                      <object data={url} type="application/pdf" className="w-full h-[70vh]">
                        <div className="p-3 text-xs text-black">
                          <p>Unable to display PDF inline.</p>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded bg-black text-white px-3 py-1.5">Open in new tab</a>
                        </div>
                      </object>
                    );
                  }
                  if (isImage) {
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={url} alt={selectedFile.name} className="w-full h-auto" />;
                  }
                  return (
                    <div className="p-3 text-xs text-black">
                      <p>This file type cannot be previewed. Use Download to view it.</p>
                      <a href={url} download className="mt-2 inline-block rounded bg-black text-white px-3 py-1.5">Download</a>
                    </div>
                  );
                })()}
              </div>
              {(translating || translated) && (
                <div className="mt-3 rounded-lg bg-white/5 p-3">
                  <p className="text-xs opacity-80">Translation</p>
                  {translating ? (
                    <p className="text-sm">Translating…</p>
                  ) : (
                    <pre className="mt-1 whitespace-pre-wrap text-sm">{translated}</pre>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/30 bg-white/10 p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white flex-none">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M6 3h9a2 2 0 0 1 2 2v14l-6-3-6 3V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] opacity-80">{p.type}</p>
                      <h2 className="text-base font-semibold truncate" title={p.name}>{p.name}</h2>
                    </div>
                    <span className={`text-[11px] rounded px-2 py-1 ${p.status === "Active" ? "bg-white/20" : "bg-white/10"}`}>{p.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="opacity-75">Coverage</p>
                      <p className="font-semibold">{p.coverage}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2">
                      <p className="opacity-75">Deductible</p>
                      <p className="font-semibold">{p.deductible || "—"}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2 col-span-2">
                      <p className="opacity-75">Renewal</p>
                      <p className="font-semibold">{p.renewalISO ? formatDateDisplay(p.renewalISO) : "—"}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] opacity-75 truncate" title={p.number}>Policy No: {p.number}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <button onClick={() => setExpandedId((id) => (id === p.id ? "" : p.id))} className="rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">{expandedId === p.id ? "Hide" : "Details"}</button>
                    <button onClick={() => handleCopy(p.number)} className="rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">Copy number</button>
                    <button onClick={() => handleDownloadCard(p)} className="rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">Download e-card</button>
                    <button onClick={() => handleRenewalICS(p)} className="rounded-md bg-white/20 hover:bg-white/25 px-2 py-1">Renewal reminder</button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-md bg-white/10 hover:bg-white/15 px-2 py-1">Remove</button>
                  </div>
                  {expandedId === p.id && (
                    <div className="mt-3 rounded-lg bg-white/5 p-3 text-sm opacity-90">
                      <p>{p.details || "No additional details."}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}

