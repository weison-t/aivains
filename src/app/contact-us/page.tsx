export default function ContactUsPage() {
  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 opacity-90">Speak with our support team for claim guidance and policy questions.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/10 p-4">
            <h2 className="font-semibold">Support</h2>
            <p className="opacity-90 text-sm mt-1">support@aetheriondataworks.com</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <h2 className="font-semibold">Hotline</h2>
            <p className="opacity-90 text-sm mt-1">+1 (555) 123-4567 (Mon–Fri)</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 sm:col-span-2">
            <h2 className="font-semibold">Hours</h2>
            <p className="opacity-90 text-sm mt-1">Mon–Fri, 9:00am–6:00pm (local time)</p>
          </div>
        </div>
      </div>
    </section>
  );
}

