import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import MobileNav from "./components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIVA by Aetherion Dataworks — Insurance Claims Assistant",
  description:
    "AIVA helps customers and teams manage insurance claims with a simple, neat interface.",
  metadataBase: new URL("https://aiva.local"),
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "AIVA by Aetherion Dataworks",
    description:
      "Simple, neat, mobile-first interface for insurance claims and support.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVA by Aetherion Dataworks",
    description:
      "Simple, neat, mobile-first interface for insurance claims and support.",
  },
  applicationName: "AIVA",
  creator: "Aetherion Dataworks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 text-white`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="w-full sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:py-5 flex items-center justify-between rounded-b-2xl bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 border-b border-purple-200 shadow-md shadow-purple-300/40 ring-1 ring-purple-200/70 text-black">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="AIVA home">
                <span className="text-xl sm:text-2xl font-semibold tracking-tight">
                  AIVA
                </span>
                <span className="hidden sm:inline opacity-80">by Aetherion Dataworks</span>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/notifications"
                  aria-label="Alerts"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-black"
                >
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/ai"
                  aria-label="AIVA AI"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-black"
                >
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M5 8l2-2m10 10l2-2M9 5l2-2m2 18l2-2M4 13h4M16 11h4M11 4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/profile"
                  aria-label="Profile"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 text-black"
                >
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 20v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <nav aria-label="Primary" className="hidden sm:flex items-center gap-2 text-sm opacity-90">
                  <Link href="/" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Home</Link>
                  <Link href="/policies" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Policies</Link>
                  <Link href="/notifications" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Alerts</Link>
                  <Link href="/appointments" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Appointments</Link>
                  <Link href="/branch-locator" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Branches</Link>
                  <Link href="/profile" className="text-black/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded px-2 py-1">Profile</Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 pb-16 sm:pb-0">
            {children}
          </main>
          <footer className="w-full hidden sm:block">
            <div className="mx-auto max-w-7xl px-4 py-6 text-xs sm:text-sm opacity-80 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                © {new Date().getFullYear()} Aetherion Dataworks
              </p>
              <p className="opacity-80">Insurance • Claims • Support</p>
            </div>
          </footer>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
