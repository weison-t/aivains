"use client";

import { useMemo, useState } from "react";

export default function FormsSubmissionPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<boolean>(false);

  const templateText = useMemo(() => {
    return [
      "Travel Insurance Claim Form",
      "--------------------------------",
      "Full Name: ____________",
      "Policy No.: ____________",
      "Passport No.: ____________",
      "Destination Country: ____________",
      "Phone: ____________",
      "Email: ____________",
      "Departure Date (YYYY-MM-DD): ____________",
      "Return Date (YYYY-MM-DD): ____________",
      "Airline / Flight No.: ____________",
      "Type of Claim: Medical / Cancellation / Delay / Baggage / Other: ______",
      "Incident DateTime: ____________",
      "Incident Location: ____________",
      "Incident Description: ____________",
      "Bank: ____________  Account No.: ____________  Account Name: ____________",
    ].join("\n");
  }, []);

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Travel_Claim_Form.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const types = fd.getAll("claimTypes");
    fd.delete("claimTypes");
    fd.set("claimTypes", types.join(", "));

    try {
      const res = await fetch("/api/travel-claim", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Submitted! We'll be in touch via email.");
      form.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Travel Claim Form</h1>
            <p className="mt-1 opacity-90">填写或下载模板 • 填寫或下載 • กรอกหรือดาวน์โหลด • Isi atau muat turun</p>
          </div>
          {selected && (
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-3 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Download template"
          >
            Download template
          </button>
          )}
        </div>

        {!selected ? (
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setSelected(true)}
              className="text-left rounded-2xl bg-white ring-1 ring-black/10 p-4 sm:p-5 shadow-sm hover:ring-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              aria-label="Open Travel Claim form"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow">
                    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M2 12h2l3 7h10l3-7h2" /><path d="M7 12l5-9 5 9" /></svg>
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-black">Travel Claim</h2>
                    <p className="text-sm text-black/70">Submit a travel insurance claim or download a blank template.</p>
                  </div>
                </div>
                <span className="text-black/50" aria-hidden>→</span>
              </div>
            </button>
          </div>
        ) : (
        <div className="rounded-2xl bg-white text-black ring-1 ring-black/10 p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data" aria-label="Travel claim form">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Insured Person Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput name="fullName" label="Full Name" required />
              <TextInput name="policyNo" label="Policy No." required />
              <TextInput name="passportNo" label="Passport No." required />
              <TextInput name="destinationCountry" label="Destination Country" required />
              <TextInput name="phone" label="Phone" type="tel" required />
              <TextInput name="email" label="Email" type="email" required />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Travel Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput name="departureDate" label="Departure Date" type="date" required />
              <TextInput name="returnDate" label="Return Date" type="date" required />
              <TextInput name="airline" label="Airline / Flight No." />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Type of Claim</h2>
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Checkbox name="claimTypes" value="Medical Expenses" label="Medical Expenses" />
              <Checkbox name="claimTypes" value="Trip Cancellation" label="Trip Cancellation" />
              <Checkbox name="claimTypes" value="Travel Delay" label="Travel Delay" />
              <Checkbox name="claimTypes" value="Baggage Loss" label="Baggage Loss" />
              <div className="flex items-center gap-2">
                <input id="otherClaim" name="claimTypes" value="Other" type="checkbox" className="h-4 w-4 border-white/30 bg-white/10" />
                <label htmlFor="otherClaim" className="text-sm">Other</label>
                <input name="otherClaimDetail" placeholder="Specify" className="ml-2 flex-1 rounded-md bg-white/10 ring-1 ring-white/20 px-3 py-2 text-sm placeholder-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" />
              </div>
            </fieldset>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Incident Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput name="incidentDateTime" label="Date/Time of Incident" type="datetime-local" required />
              <TextInput name="incidentLocation" label="Location" required />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                name="incidentDescription"
                required
                className="mt-1 w-full rounded-lg bg-white ring-1 ring-black/10 px-3 py-2 text-sm text-black placeholder-black/50 min-h-[160px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                placeholder="Briefly describe what happened..."
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Attachments</h2>
            <ul className="list-disc pl-5 text-sm text-black/70">
              <li>Passport Copy</li>
              <li>Medical Receipts</li>
              <li>Police Report (if any)</li>
              <li>Other Supporting Documents</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileInput name="passportCopy" label="Passport Copy" required />
              <FileInput name="medicalReceipts" label="Medical Receipts (PDF/Images, multiple)" multiple />
              <FileInput name="policeReport" label="Police Report (optional)" />
              <FileInput name="otherDocs" label="Other Supporting Documents (optional, multiple)" multiple />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Bank Account for Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput name="bankName" label="Bank" required />
              <TextInput name="accountNo" label="Account No." required />
              <TextInput name="accountName" label="Account Name" required />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Declaration</h2>
            <div className="flex items-start gap-3">
              <input id="declaration" name="declaration" type="checkbox" required className="mt-1 h-4 w-4 border-white/30 bg-white/10" />
              <label htmlFor="declaration" className="text-sm opacity-90">
                I hereby declare that all information given above is true and correct.
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileInput name="signatureFile" label="Signature Image" />
              <TextInput name="signatureDate" label="Date" type="date" required />
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="rounded-lg px-4 py-2 text-white bg-black disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Claim"}
            </button>
            {success && <p className="text-sm text-green-700">{success}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
        </div>
        )}
      </div>
    </section>
  );
}

function TextInput({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean; }) {
  return (
    <label className="block">
      <Label>{label}{required && <span className="text-red-600"> *</span>}</Label>
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-md bg-white ring-1 ring-black/10 px-3 py-2 text-sm text-black placeholder-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20" />
    </label>
  );
}

function FileInput({ label, name, multiple = false, required = false }: { label: string; name: string; multiple?: boolean; required?: boolean; }) {
  return (
    <label className="block">
      <Label>{label}{required && <span className="text-red-600"> *</span>}</Label>
      <input name={name} type="file" multiple={multiple} required={required} className="mt-1 w-full text-sm text-black file:mr-2 file:rounded-md file:border file:border-black/10 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-black" />
    </label>
  );
}

function Checkbox({ label, name, value }: { label: string; name: string; value: string; }) {
  const id = `${name}-${value.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-center gap-2">
      <input id={id} name={name} value={value} type="checkbox" className="h-4 w-4 accent-black border-black/30" />
      <label htmlFor={id} className="text-sm text-black">{label}</label>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-sm font-medium text-black">{children}</span>;
}

