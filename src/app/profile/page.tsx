"use client";

import { useEffect, useRef, useState } from "react";

type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  inApp: boolean;
};

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  bankAccount: string;
  avatarDataUrl: string | null;
  notifications: NotificationPrefs;
};

const defaultProfile: Profile = {
  fullName: "",
  email: "",
  phone: "",
  bankAccount: "",
  avatarDataUrl: null,
  notifications: { email: true, sms: false, inApp: true },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aiva_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Profile;
        setProfile({ ...defaultProfile, ...parsed });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleChange = (k: keyof Profile) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile((p) => ({ ...p, [k]: e.target.value }));
  };

  const handleTogglePref = (k: keyof NotificationPrefs) => () => {
    setProfile((p) => ({ ...p, notifications: { ...p.notifications, [k]: !p.notifications[k] } }));
  };

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setProfile((p) => ({ ...p, avatarDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem("aiva_profile", JSON.stringify(profile));
    const ts = new Date().toLocaleString();
    setLastSavedAt(ts);
  };

  const handleReset = () => {
    localStorage.removeItem("aiva_profile");
    setProfile(defaultProfile);
    setLastSavedAt("");
  };

  return (
    <section className="px-4 py-4 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl border border-white/30 bg-white/10 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Change avatar"
              onClick={handlePickAvatar}
              className="relative inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white ring-1 ring-black/10 text-black overflow-hidden"
            >
              {profile.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarDataUrl} alt="Profile avatar" className="h-full w-full object-cover" />
              ) : (
                <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 20v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold">{profile.fullName || "Your Name"}</h1>
              <p className="text-xs opacity-90">{profile.email || "Add your email"}</p>
              {lastSavedAt && (
                <p className="mt-0.5 text-[11px] opacity-75">Last saved: {lastSavedAt}</p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <a href="/policies" className="rounded-md bg-white text-fuchsia-700 font-semibold px-3 py-1.5 text-sm" aria-label="View policies">Policies</a>
              <a href="/forms-submission" className="rounded-md bg-white/80 text-fuchsia-700 font-semibold px-3 py-1.5 text-sm" aria-label="Start submission">Submit</a>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelected}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-2 text-center">
            <p className="text-[11px] opacity-80">Policies</p>
            <p className="text-base font-semibold">2</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-center">
            <p className="text-[11px] opacity-80">Claims in progress</p>
            <p className="text-base font-semibold">0</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-center">
            <p className="text-[11px] opacity-80">Completed</p>
            <p className="text-base font-semibold">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
            <h2 className="font-semibold">Contact Details</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-xs mb-1">Full Name</label>
                <input id="fullName" value={profile.fullName} onChange={handleChange("fullName")} className="w-full rounded bg-white/10 px-2.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs mb-1">Email</label>
                <input id="email" type="email" value={profile.email} onChange={handleChange("email")} className="w-full rounded bg-white/10 px-2.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="jane@example.com" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs mb-1">Phone</label>
                <input id="phone" value={profile.phone} onChange={handleChange("phone")} className="w-full rounded bg-white/10 px-2.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="012-3456789" />
              </div>
              <div>
                <label htmlFor="bankAccount" className="block text-xs mb-1">Bank Account (for payouts)</label>
                <input id="bankAccount" value={profile.bankAccount} onChange={handleChange("bankAccount")} className="w-full rounded bg-white/10 px-2.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="MY-XXXX-XXXX" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
            <h2 className="font-semibold">Notification Preferences</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.notifications.email} onChange={handleTogglePref("email")} className="h-3.5 w-3.5" />
                Email updates
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.notifications.sms} onChange={handleTogglePref("sms")} className="h-3.5 w-3.5" />
                SMS notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.notifications.inApp} onChange={handleTogglePref("inApp")} className="h-3.5 w-3.5" />
                In‑app alerts
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button onClick={handleSave} className="inline-flex items-center justify-center rounded-md bg-white text-fuchsia-700 font-semibold px-3 py-1.5 text-sm" aria-label="Save profile">Save changes</button>
          <button onClick={handleReset} className="inline-flex items-center justify-center rounded-md bg-white/20 hover:bg-white/25 font-semibold px-3 py-1.5 text-sm" aria-label="Reset profile">Reset</button>
        </div>
      </div>
    </section>
  );
}

