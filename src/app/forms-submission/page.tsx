"use client";

import { useState } from "react";

type UploadState = {
  fullName: string;
  email: string;
  policyNumber: string;
  notes: string;
};

export default function FormsSubmissionPage() {
  const [form, setForm] = useState<UploadState>({
    fullName: "",
    email: "",
    policyNumber: "",
    notes: "",
  });

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
        <h1 className="text-2xl sm:text-3xl font-bold">Forms Submission</h1>
        <p className="mt-2 opacity-90">Securely upload your documents. A claims specialist will review and follow up.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Forms submission">
          <div>
            <label htmlFor="fullName" className="block text-sm mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange("fullName")}
              required
              className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label htmlFor="policyNumber" className="block text-sm mb-1">
              Policy Number
            </label>
            <input
              id="policyNumber"
              name="policyNumber"
              value={form.policyNumber}
              onChange={handleChange("policyNumber")}
              required
              className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              placeholder="ABC-123456"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange("notes")}
              rows={4}
              className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              placeholder="Additional details about your claim..."
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Submit forms"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

