"use client";

import { useState } from "react";

const slots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00",
];

export default function AppointmentsPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<string>("");

  const handleBook = () => {
    if (!selected) return alert("Please select a time slot");
    alert(`Booked ${date} at ${selected} (demo)`);
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Appointments</h1>
        <div className="rounded-xl bg-white/10 p-4">
          <label htmlFor="date" className="block text-sm mb-1">Select date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded bg-white/10 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-white/70" />
          <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
            {slots.map((t) => (
              <button
                key={t}
                onClick={() => setSelected(t)}
                className={`rounded px-3 py-2 text-sm ${selected === t ? "bg-white text-fuchsia-700" : "bg-white/10 hover:bg-white/15"}`}
                aria-pressed={selected === t}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={handleBook} className="rounded-lg bg-white text-fuchsia-700 font-semibold px-4 py-2">Book</button>
          </div>
        </div>
      </div>
    </section>
  );
}

