import Link from "next/link";
import type { ReactNode } from "react";
type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const baseLinkClasses =
  "flex flex-col items-center justify-center py-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export default function MobileNav() {
  const items: NavItem[] = [
    {
      href: "/ai",
      label: "AIVA AI",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M5 8l2-2m10 10l2-2M9 5l2-2m2 18l2-2M4 13h4M16 11h4M11 4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/policies",
      label: "Policies",
      icon: (
        <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M6 3h9a2 2 0 0 1 2 2v14l-6-3-6 3V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

