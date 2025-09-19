"use client";

import { useMemo, useState } from "react";

type Mode = "download" | "fill";
type FormKind = "medical" | "accident";

type MedicalForm = {
  fullName: string;
  policyNumber: string;
  treatmentDate: string;
  hospital: string;
  claimAmount: string;
  notes: string;
};

type AccidentForm = {
  fullName: string;
  policyNumber: string;
  incidentDate: string;
  location: string;
  policeReportNo: string;
  description: string;
};

export default function FormsSubmissionPage() {
  const [mode, setMode] = useState<Mode>("download");
  const [kind, setKind] = useState<FormKind>("medical");

  const [medical, setMedical] = useState<MedicalForm>({
    fullName: "",
    policyNumber: "",
    treatmentDate: "",
    hospital: "",
    claimAmount: "",
    notes: "",
  });

  const [accident, setAccident] = useState<AccidentForm>({
    fullName: "",
    policyNumber: "",
    incidentDate: "",
    location: "",
    policeReportNo: "",
    description: "",
  });

  const handleMedicalChange = (field: keyof MedicalForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setMedical((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAccidentChange = (field: keyof AccidentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setAccident((prev) => ({ ...prev, [field]: e.target.value }));

  const templateText = useMemo(() => {
    if (kind === "medical") {
      return [
        "Medical Claim Form",
        "-------------------",
        "Full Name: ____________",
        "Policy Number: ____________",
        "Treatment Date (YYYY-MM-DD): ____________",
        "Hospital/Clinic: ____________",
        "Claim Amount (MYR): ____________",
        "Notes: ____________",
        "",
        "Checklist:",
        "[ ] Receipt / Invoice",
        "[ ] Doctor's memo",
        "[ ] Copy of IC/Passport",
      ].join("\n");
    }
    return [
      "Accident Claim Form",
      "--------------------",
      "Full Name: ____________",
      "Policy Number: ____________",
      "Incident Date (YYYY-MM-DD): ____________",
      "Location: ____________",
      "Police Report No.: ____________",
      "Brief Description: ____________",
      "",
      "Checklist:",
      "[ ] Police report",
      "[ ] Photos of incident",
      "[ ] Repair quotation / medical bills",
    ].join("\n");
  }, [kind]);

  const handleDownload = () => {
    const filename = kind === "medical" ? "Medical_Claim_Form.txt" : "Accident_Claim_Form.txt";
    const blob = new Blob([templateText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Submitted! (demo only)");
  };

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Forms Submission</h1>
        <p className="mt-2 opacity-90">Choose a form type and either download a template or fill it in directly.</p>

        <div className="mt-4 flex flex-wrap gap-2 items-center" aria-label="Form type">
          <span className="text-sm opacity-80">Form:</span>
          <button
            type="button"
            className={"rounded-lg px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " + (kind === "medical" ? "bg-white text-fuchsia-700" : "bg-white/10 text-white/90 hover:bg-white/15")}
            aria-pressed={kind === "medical"}
            onClick={() => setKind("medical")}
          >
            Medical claim
          </button>
          <button
            type="button"
            className={"rounded-lg px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " + (kind === "accident" ? "bg-white text-fuchsia-700" : "bg-white/10 text-white/90 hover:bg-white/15")}
            aria-pressed={kind === "accident"}
            onClick={() => setKind("accident")}
          >
            Accident claim
          </button>
        </div>

        <div className="mt-3 inline-flex rounded-xl bg-white/10 p-1 ring-1 ring-white/20" role="tablist" aria-label="Mode">
          <button
            type="button"
            className={"rounded-lg px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 " + (mode === "download" ? "bg-white text-fuchsia-700" : "text-white/90 hover:text-white")}
            role="tab"
            aria-selected={mode === "download"}
            aria-controls="download-panel"
            onClick={() => setMode("download")}
          >
            Download template
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
          <div id="download-panel" role="tabpanel" className="mt-6">
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-sm opacity-90">A simple template will be downloaded as a text file:</p>
              <pre className="mt-3 whitespace-pre-wrap text-xs opacity-90">{templateText}</pre>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="Download template"
                >
                  Download template
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div id="fill-panel" role="tabpanel" className="mt-6">
            {kind === "medical" ? (
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Medical claim form">
                <div>
                  <label htmlFor="m-fullName" className="block text-sm mb-1">Full Name</label>
                  <input id="m-fullName" value={medical.fullName} onChange={handleMedicalChange("fullName")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="m-policyNumber" className="block text-sm mb-1">Policy Number</label>
                  <input id="m-policyNumber" value={medical.policyNumber} onChange={handleMedicalChange("policyNumber")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="ABC-123456" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="m-treatmentDate" className="block text-sm mb-1">Treatment Date</label>
                    <input id="m-treatmentDate" type="date" value={medical.treatmentDate} onChange={handleMedicalChange("treatmentDate")} required className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" />
                  </div>
                  <div>
                    <label htmlFor="m-amount" className="block text-sm mb-1">Claim Amount (MYR)</label>
                    <input id="m-amount" type="number" inputMode="decimal" value={medical.claimAmount} onChange={handleMedicalChange("claimAmount")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="150.00" />
                  </div>
                </div>
                <div>
                  <label htmlFor="m-hospital" className="block text-sm mb-1">Hospital/Clinic</label>
                  <input id="m-hospital" value={medical.hospital} onChange={handleMedicalChange("hospital")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="ABC Specialist Centre" />
                </div>
                <div>
                  <label htmlFor="m-notes" className="block text-sm mb-1">Notes</label>
                  <textarea id="m-notes" rows={4} value={medical.notes} onChange={handleMedicalChange("notes")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Additional information..." />
                </div>
                <div className="pt-2">
                  <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Submit medical claim form">
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Accident claim form">
                <div>
                  <label htmlFor="a-fullName" className="block text-sm mb-1">Full Name</label>
                  <input id="a-fullName" value={accident.fullName} onChange={handleAccidentChange("fullName")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="a-policyNumber" className="block text-sm mb-1">Policy Number</label>
                  <input id="a-policyNumber" value={accident.policyNumber} onChange={handleAccidentChange("policyNumber")} required className="w-full rounded-lg bg-white/10 placeholder-white/60 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="ABC-123456" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="a-incidentDate" className="block text-sm mb-1">Incident Date</label>
                    <input id="a-incidentDate" type="date" value={accident.incidentDate} onChange={handleAccidentChange("incidentDate")} required className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" />
                  </div>
                  <div>
                    <label htmlFor="a-report" className="block text-sm mb-1">Police Report No.</label>
                    <input id="a-report" value={accident.policeReportNo} onChange={handleAccidentChange("policeReportNo")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="RPT-2025-0001" />
                  </div>
                </div>
                <div>
                  <label htmlFor="a-location" className="block text-sm mb-1">Location</label>
                  <input id="a-location" value={accident.location} onChange={handleAccidentChange("location")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jalan Tun Razak, KL" />
                </div>
                <div>
                  <label htmlFor="a-desc" className="block text-sm mb-1">Brief Description</label>
                  <textarea id="a-desc" rows={4} value={accident.description} onChange={handleAccidentChange("description")} className="w-full rounded-lg bg-white/10 focus:bg-white/15 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="What happened?" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2 hover:bg-white/90 active:bg-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Submit accident claim form">
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

