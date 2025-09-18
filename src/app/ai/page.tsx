"use client";

import { useEffect, useRef, useState } from "react";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

export default function AIPage() {
  const initialGreeting: ChatMessage = {
    role: "assistant",
    content: "Hi, I’m AIVA. How can I help with your insurance today?",
  };
  const HISTORY_ENDPOINT = "/api/ai/history";

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Load from Supabase via API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(HISTORY_ENDPOINT, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: ChatMessage[] };
        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  // Persist to Supabase via API when messages change
  useEffect(() => {
    const save = async () => {
      try {
        await fetch(HISTORY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
      } catch {
        // ignore
      }
    };
    // avoid posting the initial state only greeting if no user messages yet
    if (messages.length >= 1) {
      save();
    }
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user", content: trimmed } as ChatMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data?.message?.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message.content }]);
      } else if (data?.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClear = () => {
    const ok = confirm("Clear chat history?");
    if (!ok) return;
    setMessages([initialGreeting]);
    // server will be updated by the messages effect
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">AIVA AI</h1>
            <p className="mt-2 opacity-90">Ask AIVA to help with claims, documents, and policy info.</p>
          </div>
          <button
            onClick={handleClear}
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/20 hover:bg-white/15"
            aria-label="Clear chat history"
          >
            Clear chat
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-white/30 bg-white/10 p-4">
          <div
            ref={listRef}
            className="max-h-[55vh] overflow-y-auto pr-1 space-y-3"
            role="log"
            aria-live="polite"
          >
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-white text-fuchsia-700 px-3 py-2 shadow ring-1 ring-fuchsia-100"
                    : "mr-auto max-w-[85%] rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
                }
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="mr-auto w-20 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                <p className="text-sm opacity-80">AIVA is typing…</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message AIVA"
              placeholder="Type your question…"
              className="flex-1 rounded-xl bg-white px-3 py-2 text-black placeholder-black/50 ring-1 ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 px-4 py-2 text-black ring-1 ring-purple-200 hover:opacity-90 disabled:opacity-60"
              aria-disabled={loading}
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[11px] opacity-70">
            AIVA may produce inaccurate information. Don’t share sensitive data.
          </p>
        </div>
      </div>
    </section>
  );
}


