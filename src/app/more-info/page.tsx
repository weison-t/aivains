export default function MoreInfoPage() {
  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">More Info</h1>
        <p className="mt-2 opacity-90">Guides, FAQs, and policy resources to help you file confidently.</p>

        <div className="mt-6 space-y-4">
          <details className="rounded-lg bg-white/10 open:bg-white/15 p-4">
            <summary className="cursor-pointer font-semibold">How do I file a claim?</summary>
            <p className="mt-2 opacity-90">Gather receipts, reports, and photos. Complete the relevant form and submit online. You’ll receive a case ID.</p>
          </details>
          <details className="rounded-lg bg-white/10 open:bg-white/15 p-4">
            <summary className="cursor-pointer font-semibold">What documents are required?</summary>
            <p className="mt-2 opacity-90">Government ID, policy number, medical bills or repair invoices, and any official reports.</p>
          </details>
          <details className="rounded-lg bg-white/10 open:bg-white/15 p-4">
            <summary className="cursor-pointer font-semibold">How long does processing take?</summary>
            <p className="mt-2 opacity-90">Most claims are processed within 7–10 business days after complete documentation is received.</p>
          </details>
        </div>
      </div>
    </section>
  );
}

