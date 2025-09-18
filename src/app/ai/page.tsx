"use client";
export const dynamic = "force-dynamic";

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
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"chat" | "summarize" | "translate">("chat");
  const [targetLang, setTargetLang] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const downscaleDataUrl = async (src: string, maxDim = 1280, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width: w, height: h } = img;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const nw = Math.max(1, Math.round(w * scale));
        const nh = Math.max(1, Math.round(h * scale));
        const c = document.createElement("canvas");
        c.width = nw; c.height = nh;
        const cx = c.getContext("2d");
        if (!cx) return resolve(src);
        cx.drawImage(img, 0, 0, nw, nh);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) => {
    const timeoutMs = init?.timeoutMs ?? 60000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  // Load from Supabase via API on mount (Supabase only)
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
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // Persist to Supabase via API when messages change (Supabase only)
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
    if (!loaded) return;
    save();
  }, [messages, loaded]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (file) {
        const form = new FormData();
        form.append("mode", mode);
        form.append("targetLang", targetLang);
        form.append("question", input.trim());
        form.append("maxPages", "8");
        form.append("file", file);
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: `${mode === "translate" ? "Translate" : mode === "summarize" ? "Summarize" : "Analyze"} attachment: ${file.name}${input.trim() ? `\nQuestion: ${input.trim()}` : ""}`,
          },
        ]);
        setInput("");
        setFile(null);
        const isPdf = (file.type?.includes("pdf") || (file.name || "").toLowerCase().endsWith(".pdf"));
        const res = await fetchWithTimeout(isPdf ? "/api/ai/retrieve" : "/api/ai/analyze", {
          method: "POST",
          body: form,
          timeoutMs: 60000,
        });
        const data = await res.json();
        if (isPdf && (res.status === 501 || !res.ok || !data?.content)) {
          // Final client-side OCR fallback: render pages and call translate-images
          try {
            const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
            (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc =
              `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as unknown as { version: string }).version}/pdf.worker.min.js`;
            const ab = await file.arrayBuffer();
            const loadingTask = (pdfjs as unknown as { getDocument: (opts: unknown) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number }; render: (a: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }> }> } }).getDocument({ data: ab });
            const doc = await loadingTask.promise;
            const limit = Math.min(doc.numPages || 1, 5);
            const images: string[] = [];
            for (let i = 1; i <= limit; i += 1) {
              const page = await doc.getPage(i);
              const viewport = page.getViewport({ scale: 1.6 });
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) continue;
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: ctx, viewport }).promise;
              const raw = canvas.toDataURL("image/jpeg", 0.7);
              const small = await downscaleDataUrl(raw, 1400, 0.65);
              images.push(small);
            }
            if (images.length) {
              const visionRes = await fetchWithTimeout("/api/translate-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images, targetLanguage: targetLang, mode, question: input.trim() }),
                timeoutMs: 60000,
              });
              const visionJson = await visionRes.json();
              if (visionRes.ok && visionJson?.translated) {
                setMessages((prev) => [...prev, { role: "assistant", content: visionJson.translated }]);
                return;
              }
            }
          } catch {
            // ignore and fall through
          }
        }
        if (res.ok && data?.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${data?.error || "Failed to process attachment."}` },
          ]);
        }
      } else {
        const trimmed = input.trim();
        if (!trimmed) { setLoading(false); return; }
        const next = [...messages, { role: "user", content: trimmed } as ChatMessage];
        setMessages(next);
        setInput("");
        const res = await fetchWithTimeout("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
          timeoutMs: 60000,
        });
        const data = await res.json();
        if (data?.message?.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.message.content }]);
        } else if (data?.error) {
          setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
        }
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2 items-center">
            <div className="flex gap-2">
              <select value={mode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as "chat" | "summarize" | "translate")} aria-label="Mode" className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
                <option value="chat">Chat</option>
                <option value="summarize">Summarize</option>
                <option value="translate">Translate</option>
              </select>
              {mode === "translate" && (
                <select value={targetLang} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetLang(e.target.value)} aria-label="Target language" className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
                  <option>English</option>
                  <option>中文</option>
                  <option>ไทย</option>
                  <option>Bahasa Melayu</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-black ring-1 ring-black/10 cursor-pointer">
                <input type="file" accept="image/*,application/pdf,text/*" capture="environment" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} aria-label="Upload attachment" />
                <span className="text-sm">{file ? file.name : "Attach"}</span>
              </label>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} aria-label="Take photo" />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/20 hover:bg-white/15"
                aria-label="Open camera"
              >
                Camera
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Message AIVA"
                placeholder={file ? "Optional question for the attachment…" : "Type your question…"}
                className="flex-1 rounded-xl bg-white px-3 py-2 text-black placeholder-black/50 ring-1 ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              />
            </div>
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


