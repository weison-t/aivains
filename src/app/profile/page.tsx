"use client";

import { useEffect, useState } from "react";

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  bankAccount: string;
};

const defaultProfile: Profile = {
  fullName: "",
  email: "",
  phone: "",
  bankAccount: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  useEffect(() => {
    const saved = localStorage.getItem("aiva_profile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleChange = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((p) => ({ ...p, [k]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem("aiva_profile", JSON.stringify(profile));
    alert("Saved (local demo)");
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Profile</h1>
        <div className="space-y-3">
          <div>
            <label htmlFor="fullName" className="block text-sm mb-1">Full Name</label>
            <input id="fullName" value={profile.fullName} onChange={handleChange("fullName")} className="w-full rounded bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input id="email" type="email" value={profile.email} onChange={handleChange("email")} className="w-full rounded bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="jane@example.com" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm mb-1">Phone</label>
            <input id="phone" value={profile.phone} onChange={handleChange("phone")} className="w-full rounded bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="012-3456789" />
          </div>
          <div>
            <label htmlFor="bankAccount" className="block text-sm mb-1">Bank Account (for payouts)</label>
            <input id="bankAccount" value={profile.bankAccount} onChange={handleChange("bankAccount")} className="w-full rounded bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" placeholder="MY-XXXX-XXXX" />
          </div>
          <div className="pt-2">
            <button onClick={handleSave} className="rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2">Save</button>
          </div>
        </div>
      </div>
    </section>
  );
}

