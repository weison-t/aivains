import Link from "next/link";
type NavItem = {
  href: string;
  label: string;
  icon: JSX.Element;
};

const baseLinkClasses =
  "flex flex-col items-center justify-center py-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export default function MobileNav() {
  const items: NavItem[] = [
    {
      href: "/notifications",
      label: "Alerts",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h-5a3 3 0 1 0 0 6h5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/",
      label: "Home",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: "/appointments",
      label: "Appt",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 gap-2 rounded-2xl bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 border border-purple-200 shadow-lg shadow-purple-300/40 ring-1 ring-purple-200 mb-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={baseLinkClasses + " text-black hover:text-black/70 rounded-xl py-2.5"}
            >
              <span className="inline-flex items-center justify-center rounded-full p-1.5 bg-white ring-1 ring-black/10 text-black">
                {item.icon}
              </span>
              <span className="mt-1 text-[11px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

