"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = string; // e.g., "09:30"

const BASE_SLOTS: Slot[] = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00",
];

const getSlotsForDate = (isoDate: string): Slot[] => {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDay(); // 0 Sun ... 6 Sat
  if (day === 0) return ["10:00", "10:30", "11:00"]; // Sun
  if (day === 6) return ["09:00", "09:30", "10:00", "10:30"]; // Sat
  return BASE_SLOTS; // Weekday
};

// Monday-first weekday labels
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toISODateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fromISODateLocal = (iso: string) => {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export default function AppointmentsPage() {
  const todayISO = toISODateLocal(new Date());
  const [viewDate, setViewDate] = useState<Date>(startOfMonth(new Date()));
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);
  const [selectedSlot, setSelectedSlot] = useState<Slot>("");
  const [filter, setFilter] = useState<"all" | "am" | "pm">("all");
  type Booking = { id: string; dateISO: string; slot: string; createdAtISO: string };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBookedId, setLastBookedId] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("aiva_bookings");
    if (saved) {
      try {
        setBookings(JSON.parse(saved) as Booking[]);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aiva_bookings", JSON.stringify(bookings));
  }, [bookings]);

  const monthMatrix = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
    const startWeekday = (start.getDay() + 6) % 7;
    const daysInMonth = end.getDate();

    const days: { iso: string; inMonth: boolean; isToday: boolean; isPast: boolean }[] = [];
    // leading blanks from prev month (rendered as empty cells)
    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - (startWeekday - i));
      const iso = toISODateLocal(d);
      days.push({ iso, inMonth: false, isToday: iso === todayISO, isPast: iso < todayISO });
    }
    // current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const iso = toISODateLocal(d);
      days.push({ iso, inMonth: true, isToday: iso === todayISO, isPast: iso < todayISO });
    }
    // trailing to complete week grid (up to 42 cells)
    while (days.length % 7 !== 0) {
      const last = fromISODateLocal(days[days.length - 1].iso);
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      const iso = toISODateLocal(d);
      days.push({ iso, inMonth: false, isToday: iso === todayISO, isPast: iso < todayISO });
    }
    return days;
  }, [viewDate, todayISO]);

  const displayMonth = viewDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  const allSlots = useMemo(() => getSlotsForDate(selectedDateISO), [selectedDateISO]);
  const filteredSlots = allSlots.filter((t) => {
    if (filter === "all") return true;
    const hour = parseInt(t.split(":")[0] || "0", 10);
    return filter === "am" ? hour < 12 : hour >= 12;
  });

  const handleBook = () => {
    if (!selectedSlot) return alert("Please select a time slot");
    const id = `${selectedDateISO}-${selectedSlot}-${Date.now()}`;
    const newBooking: Booking = {
      id,
      dateISO: selectedDateISO,
      slot: selectedSlot,
      createdAtISO: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    setLastBookedId(id);
    // Keep selection for quick consecutive bookings or clear? We'll clear time only.
    setSelectedSlot("");
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    if (lastBookedId === id) setLastBookedId("");
  };

  const handleDownloadICS = (b: Booking) => {
    const [hh, mm] = b.slot.split(":");
    const dt = new Date(`${b.dateISO}T${hh}:${mm}:00`);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    const H = String(dt.getHours()).padStart(2, "0");
    const M = String(dt.getMinutes()).padStart(2, "0");
    // 30-min default duration
    const dtEnd = new Date(dt.getTime() + 30 * 60 * 1000);
    const y2 = dtEnd.getFullYear();
    const m2 = String(dtEnd.getMonth() + 1).padStart(2, "0");
    const d2 = String(dtEnd.getDate()).padStart(2, "0");
    const H2 = String(dtEnd.getHours()).padStart(2, "0");
    const M2 = String(dtEnd.getMinutes()).padStart(2, "0");
    const DTSTART = `${y}${m}${d}T${H}${M}00`;
    const DTEND = `${y2}${m2}${d2}T${H2}${M2}00`;
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}00`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AIVA//Appointments//EN\nBEGIN:VEVENT\nUID:${b.id}@aiva\nDTSTAMP:${stamp}\nDTSTART:${DTSTART}\nDTEND:${DTEND}\nSUMMARY:AIVA Appointment\nDESCRIPTION:Appointment on ${b.dateISO} at ${b.slot}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiva-appointment-${b.dateISO}-${b.slot.replace(":", "")}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-4 py-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-3">Appointments</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewDate((d) => addMonths(d, -1))}
                className="rounded-md bg-white/20 hover:bg-white/25 px-1.5 py-0.5"
                aria-label="Previous month"
              >
                ‹
              </button>
              <div className="text-sm font-semibold">{displayMonth}</div>
              <button
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                className="rounded-md bg-white/20 hover:bg-white/25 px-1.5 py-0.5"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 text-center text-[11px] opacity-80">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
              {monthMatrix.map(({ iso, inMonth, isToday, isPast }, idx) => {
                const isSelected = iso === selectedDateISO;
                if (!inMonth) {
                  return <div key={`${iso}-${idx}`} role="gridcell" aria-hidden className="aspect-square rounded-lg bg-white/5" />;
                }
                return (
                  <button
                    key={`${iso}-${idx}`}
                    role="gridcell"
                    aria-selected={isSelected}
                    disabled={isPast}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDateISO(iso);
                        setSelectedSlot("");
                      }
                    }}
                    className={
                      "aspect-square rounded-lg text-xs flex items-center justify-center relative " +
                      (isSelected
                        ? "bg-white text-fuchsia-700"
                        : isToday
                        ? "bg-white/20"
                        : "bg-white/10 hover:bg-white/15") +
                      (isPast ? " opacity-60 cursor-not-allowed" : "")
                    }
                  >
                    <span className="">{parseInt(iso.slice(-2), 10)}</span>
                    {isToday && !isSelected && (
                      <span aria-hidden className="absolute inset-0 rounded-lg ring-1 ring-white/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-80">Selected date</p>
                <p className="text-sm font-semibold">{new Date(selectedDateISO + "T00:00:00").toLocaleDateString()}</p>
              </div>
              <div className="inline-flex gap-1">
                {(["all", "am", "pm"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-2 py-1 text-xs ${filter === f ? "bg-white text-fuchsia-700" : "bg-white/10 hover:bg-white/15"}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
              {filteredSlots.length === 0 && (
                <p className="col-span-3 md:col-span-4 text-xs opacity-80">No slots for this filter.</p>
              )}
              {filteredSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedSlot(t)}
                  className={`rounded px-2 py-1.5 text-sm ${selectedSlot === t ? "bg-white text-fuchsia-700" : "bg-white/10 hover:bg-white/15"}`}
                  aria-pressed={selectedSlot === t}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs opacity-80">
                {selectedSlot ? `Booking ${new Date(selectedDateISO + "T00:00:00").toLocaleDateString()} • ${selectedSlot}` : "Select a slot"}
              </p>
              <button onClick={handleBook} className="rounded-md bg-white text-fuchsia-700 font-semibold px-3 py-1.5 text-sm" disabled={!selectedSlot}>
                Book
              </button>
            </div>
            {lastBookedId && (
              <div className="mt-3 rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-sm font-semibold">Booking confirmed</p>
                {(() => {
                  const b = bookings.find((x) => x.id === lastBookedId);
                  if (!b) return null;
                  return (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-90">
                      <span>{new Date(b.dateISO + "T00:00:00").toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{b.slot}</span>
                      <button onClick={() => handleDownloadICS(b)} className="rounded bg-white text-fuchsia-700 px-2 py-1">Add to calendar</button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Booking history</h2>
            <button
              className="text-xs rounded bg-white/20 hover:bg-white/25 px-2 py-1"
              onClick={() => setBookings([])}
              aria-label="Clear all bookings"
            >
              Clear all
            </button>
          </div>
          {bookings.length === 0 ? (
            <p className="mt-2 text-xs opacity-80">No bookings yet.</p>
          ) : (
            <ul className="mt-2 space-y-2" role="list">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/20 px-2 py-0.5 text-[11px]">{new Date(b.dateISO + "T00:00:00").toLocaleDateString()}</span>
                    <span className="opacity-90">{b.slot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownloadICS(b)} className="rounded bg-white text-fuchsia-700 px-2 py-1 text-xs">.ics</button>
                    <button onClick={() => handleCancelBooking(b.id)} className="rounded bg-white/20 hover:bg-white/25 px-2 py-1 text-xs">Cancel</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

