"use client";

import { useState } from "react";

type Notice = {
  id: string;
  title: string;
  detail: string;
  read: boolean;
  time: string;
};

export default function NotificationsPage() {
  const [notices, setNotices] = useState<Notice[]>([
    { id: "1", title: "Claim submitted", detail: "Your medical claim was received.", read: false, time: "Just now" },
    { id: "2", title: "Document needed", detail: "Please upload your invoice.", read: false, time: "1h" },
    { id: "3", title: "Policy renewed", detail: "Health policy renewed successfully.", read: true, time: "2d" },
  ]);

  const handleToggle = (id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const handleMarkAll = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <button onClick={handleMarkAll} className="text-xs bg-white/15 hover:bg-white/20 rounded px-3 py-1">
            Mark all read
          </button>
        </div>
        <ul className="space-y-2" role="list">
          {notices.map((n) => (
            <li key={n.id} className={`rounded-lg p-3 ${n.read ? "bg-white/5 opacity-80" : "bg-white/10"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs opacity-90">{n.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] opacity-75">{n.time}</span>
                  <button onClick={() => handleToggle(n.id)} className="text-[10px] bg-white/15 hover:bg-white/20 rounded px-2 py-1">
                    {n.read ? "Unread" : "Read"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

