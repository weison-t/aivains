"use client";

import { useState } from "react";

type UploadState = {
  fullName: string;
  email: string;
  policyNumber: string;
  notes: string;
};

export default function ClaimsFormsPage() {
  const [mode, setMode] = useState<"download" | "fill">("download");
  const [form, setForm] = useState<UploadState>({ fullName: "", email: "", policyNumber: "", notes: "" });

  const handleChange = (field: keyof UploadState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Submitted! (demo only)");
  };

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Claims & Forms</h1>
        <p className="mt-2 opacity-90">Download templates or fill in a claim form directly.</p>

        <div className="mt-4 inline-flex rounded-xl bg-white/10 p-1 ring-1 ring-white/20" role="tablist" aria-label="Forms mode">
          <button
            type="button"
            className={"rounded-lg px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " + (mode === "download" ? "bg-white text-fuchsia-700" : "text-white/90 hover:text-white")}
            role="tab"
            aria-selected={mode === "download"}
            aria-controls="download-panel"
            onClick={() => setMode("download")}
          >
            Download templates
          </button>
          <button
            type="button"
            className={"ml-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " + (mode === "fill" ? "bg-white text-fuchsia-700" : "text-white/90 hover:text-white")}
            role="tab"
            aria-selected={mode === "fill"}
            aria-controls="fill-panel"
            onClick={() => setMode("fill")}
          >
            Fill form
          </button>
        </div>

        {mode === "download" ? (
          <div id="download-panel" role="tabpanel" aria-labelledby="Download templates" className="mt-6">
            <ul className="space-y-3" role="list">
              <li>
                <a href="#" className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Medical claim form">
                  Medical Claim Form (PDF) — outpatient, inpatient, and specialist visits
                </a>
              </li>
              <li>
                <a href="#" className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Accident claim form">
                  Accident Claim Form (PDF) — incident details and police report checklist
                </a>
              </li>
              <li>
                <a href="#" className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Policy update request">
                  Policy Update Request (DOCX) — change of address, nominees, beneficiaries
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <div id="fill-panel" role="tabpanel" aria-labelledby="Fill form" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forms submission">
              <div>
                <label htmlFor="fullName" className="block text-sm mb-1">Full Name</label>
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange("fullName")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <input id="email" type="email" name="email" value={form.email} onChange={handleChange("email")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="jane@example.com" />
              </div>
              <div>
                <label htmlFor="policyNumber" className="block text-sm mb-1">Policy Number</label>
                <input id="policyNumber" name="policyNumber" value={form.policyNumber} onChange={handleChange("policyNumber")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="ABC-123456" />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm mb-1">Notes</label>
                <textarea id="notes" name="notes" value={form.notes} onChange={handleChange("notes")} rows={4} className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Additional details about your claim..." />
              </div>
              <div className="pt-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Submit forms">
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

