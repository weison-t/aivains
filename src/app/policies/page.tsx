"use client";

import { useEffect, useMemo, useState } from "react";

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

const formatDateDisplay = (iso: string) => {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | PolicyType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | PolicyStatus>("All");
  const [expandedId, setExpandedId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Add policy feature removed per request

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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

  const handleDelete = (id: string) => {
    if (!confirm("Remove this policy?")) return;
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
        </div>

        {/* Mobile-friendly filters */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policies"
              className="flex-1 rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Search policies"
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
          {(query || typeFilter !== "All" || statusFilter !== "All") && (
            <div className="flex flex-wrap items-center gap-2">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]"
                  aria-label="Clear search"
                >
                  <span>Search: "{query}"</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {typeFilter !== "All" && (
                <button
                  onClick={() => setTypeFilter("All")}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]"
                  aria-label="Clear type filter"
                >
                  <span>Type: {typeFilter}</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {statusFilter !== "All" && (
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
                  setTypeFilter("All");
                  setStatusFilter("All");
                }}
                className="ml-auto rounded-md bg-white/10 hover:bg-white/15 px-2 py-1 text-[11px]"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            </div>
          )}
          {showFilters && (
            <div id="mobile-filters" className="rounded-2xl border border-white/20 bg-white/10 p-3 space-y-2">
              <div>
                <label className="block text-xs mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
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
                  onChange={(e) => setStatusFilter(e.target.value as any)}
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
            placeholder="Search by name or number"
            className="rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Search policies"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Active</option>
            <option>Expired</option>
          </select>
        </div>

        {/* Add policy feature removed */}

        <p className="text-xs opacity-80">{filtered.length} policy{filtered.length === 1 ? "" : "ies"} shown</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">{p.type}</p>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                </div>
                <span className={`text-xs rounded px-2 py-1 ${p.status === "Active" ? "bg-white/20" : "bg-white/10"}`}>{p.status}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Coverage: {p.coverage} • {p.deductible || "—"}</p>
              <p className="mt-1 text-xs opacity-75">Renewal: {p.renewalISO ? formatDateDisplay(p.renewalISO) : "—"} • Policy No: {p.number}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
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
          ))}
        </div>
      </div>
    </section>
  );
}

