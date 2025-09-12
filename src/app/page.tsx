export default function Home() {
  return (
    <section className="px-3 py-2 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">AIVA</h1>
          <p className="mt-1 text-xs sm:text-base opacity-90">by Aetherion Dataworks</p>
          <p className="mt-3 hidden sm:block max-w-prose opacity-90">
            Streamline your insurance journey — access claim forms, submit documentation, and get clear guidance every step of the way.
          </p>
        </div>

        <div>
          <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6"
            role="grid"
            aria-label="AIVA modules"
          >
          <a
            href="/policies"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="Policies module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M6 3h9a2 2 0 0 1 2 2v14l-6-3-6 3V5a2 2 0 0 1 2-2Z"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">Policies</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">View your active policies, coverage, and renewal dates.</p>
          </a>

          <a
            href="/forms-submission"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="Forms submission module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">Forms Submission</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">Upload documents securely, with clear guidance on what’s required for approval.</p>
          </a>

          <a
            href="/claims-forms"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="Claims forms module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 3.5V8h4.5"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">Claim Forms</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">Download standardized templates and checklists for faster processing.</p>
          </a>

          <a
            href="/branch-locator"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="Branch locator module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">Branch Locator</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">Find nearby branches and panel clinics/garages; open in Maps.</p>
          </a>

          <a
            href="/more-info"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="More information module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M12 6v6m0 6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">More Info</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">Understand coverage, timelines, and FAQs to avoid delays.</p>
          </a>

          <a
            href="/contact-us"
            className="group flex flex-col rounded-2xl border border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20 shadow-sm transition-colors p-3 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            role="gridcell"
            tabIndex={0}
            aria-label="Contact us module"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 shadow-md">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.66 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.23a2 2 0 0 1 2.11-.45c.85.32 1.73.54 2.63.66A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <h2 className="text-base sm:text-xl font-semibold">Contact Us</h2>
              </div>
              <span className="opacity-80" aria-hidden>→</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm opacity-90">Talk to a claims specialist for guidance or urgent help.</p>
          </a>
          </div>
        </div>
      </div>
    </section>
  );
}
