export default function ClaimsFormsPage() {
  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Claims Forms</h1>
        <p className="mt-2 opacity-90">Download standardized templates and checklists for faster processing.</p>

        <ul className="mt-6 space-y-3" role="list">
          <li>
            <a
              href="#"
              className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Medical claim form"
            >
              Medical Claim Form (PDF) — outpatient, inpatient, and specialist visits
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Accident claim form"
            >
              Accident Claim Form (PDF) — incident details and police report checklist
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg bg-white/10 hover:bg-white/15 p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Policy update request"
            >
              Policy Update Request (DOCX) — change of address, nominees, beneficiaries
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

