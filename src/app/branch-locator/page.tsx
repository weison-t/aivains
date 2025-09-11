const branches = [
  { name: "Kuala Lumpur HQ", address: "123 Jalan Ampang, Kuala Lumpur", maps: "https://maps.google.com?q=123+Jalan+Ampang" },
  { name: "Penang Branch", address: "45 Lebuh Pantai, George Town", maps: "https://maps.google.com?q=45+Lebuh+Pantai" },
  { name: "Johor Bahru Branch", address: "78 Jalan Wong Ah Fook, JB", maps: "https://maps.google.com?q=78+Jalan+Wong+Ah+Fook" },
];

export default function BranchLocatorPage() {
  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Branch Locator</h1>
        <ul className="space-y-3" role="list">
          {branches.map((b) => (
            <li key={b.name} className="rounded-xl bg-white/10 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm opacity-80">{b.name}</p>
                <p className="text-xs opacity-75">{b.address}</p>
              </div>
              <a href={b.maps} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/15 hover:bg-white/20 rounded px-3 py-1">
                Open in Maps
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

