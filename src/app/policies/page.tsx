export default function PoliciesPage() {
  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Policies</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Policy</p>
                <h2 className="text-lg font-semibold">Comprehensive Health</h2>
              </div>
              <span className="text-xs bg-white/20 rounded px-2 py-1">Active</span>
            </div>
            <p className="mt-2 text-sm opacity-90">Coverage: RM 250,000 | Deductible: RM 500</p>
            <p className="mt-1 text-xs opacity-75">Renewal: 12 Dec 2025 • Policy No: HL-9321-AB</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Policy</p>
                <h2 className="text-lg font-semibold">Motor Insurance</h2>
              </div>
              <span className="text-xs bg-white/20 rounded px-2 py-1">Active</span>
            </div>
            <p className="mt-2 text-sm opacity-90">Coverage: RM 80,000 | Excess: RM 300</p>
            <p className="mt-1 text-xs opacity-75">Renewal: 28 Jul 2026 • Policy No: MC-5582-ZX</p>
          </div>
        </div>
      </div>
    </section>
  );
}

