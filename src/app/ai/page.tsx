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
  const [mode, setMode] = useState<"chat" | "summarize" | "translate" | "form">("chat");
  const [targetLang, setTargetLang] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  // Form Assist state
  type TravelClaimDraft = {
    fullName?: string;
    policyNo?: string;
    passportNo?: string;
    destinationCountry?: string;
    phone?: string;
    email?: string;
    departureDate?: string;
    returnDate?: string;
    airline?: string;
    claimTypes?: string; // comma separated
    otherClaimDetail?: string;
    incidentDateTime?: string;
    incidentLocation?: string;
    incidentDescription?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
    declaration?: boolean;
    signatureDate?: string;
    attachmentsOther?: File[];
  };
  const [formDraft, setFormDraft] = useState<TravelClaimDraft>({ attachmentsOther: [] });
  const [formActive, setFormActive] = useState(false);
  const steps: Array<{ key: keyof TravelClaimDraft; label: string; required?: boolean }> = [
    { key: "fullName", label: "Full Name", required: true },
    { key: "policyNo", label: "Policy No.", required: true },
    { key: "passportNo", label: "Passport No.", required: true },
    { key: "destinationCountry", label: "Destination Country", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "email", label: "Email", required: true },
    { key: "departureDate", label: "Departure Date (YYYY-MM-DD)", required: true },
    { key: "returnDate", label: "Return Date (YYYY-MM-DD)", required: true },
    { key: "airline", label: "Airline / Flight No." },
    { key: "claimTypes", label: "Claim Types (comma separated: Medical Expenses, Trip Cancellation, Travel Delay, Baggage Loss)" },
    { key: "otherClaimDetail", label: "Other Claim Detail (if any)" },
    { key: "incidentDateTime", label: "Incident Date/Time (YYYY-MM-DD HH:mm)", required: true },
    { key: "incidentLocation", label: "Incident Location", required: true },
    { key: "incidentDescription", label: "Incident Description", required: true },
    { key: "bankName", label: "Bank Name", required: true },
    { key: "accountNo", label: "Account No.", required: true },
    { key: "accountName", label: "Account Name", required: true },
    { key: "signatureDate", label: "Signature Date (YYYY-MM-DD)", required: true },
  ];
  const [formStep, setFormStep] = useState(0);

  const extractFieldsFromFile = async (attached: File) => {
    try {
      // Build prompt asking strictly for JSON
      const question = "Extract a JSON object with ONLY these keys if present (strings): fullName, policyNo, passportNo, destinationCountry, phone, email, departureDate, returnDate, airline, claimTypes, otherClaimDetail, incidentDateTime, incidentLocation, incidentDescription, bankName, accountNo, accountName, signatureDate. Return ONLY JSON.";
      const isPdf = attached.type?.includes("pdf") || (attached.name || "").toLowerCase().endsWith(".pdf");
      let text = "";
      let content = "";
      // Try server routes tailored to file type
      if (isPdf) {
        const form = new FormData();
        form.append("mode", "chat");
        form.append("question", question);
        form.append("file", attached);
        try {
          const res = await fetchWithTimeout("/api/ai/retrieve", { method: "POST", body: form, timeoutMs: 60000 });
          const json = await res.json();
          if (res.ok && json?.content) content = json.content as string;
        } catch {}
        if (!content) {
          const alt = new FormData();
          alt.append("mode", "chat");
          alt.append("question", question);
          alt.append("file", attached);
          try {
            const res2 = await fetchWithTimeout("/api/ai/analyze", { method: "POST", body: alt, timeoutMs: 60000 });
            const json2 = await res2.json();
            if (res2.ok && json2?.content) content = json2.content as string;
          } catch {}
        }
      } else {
        const form = new FormData();
        form.append("mode", "chat");
        form.append("question", question);
        form.append("file", attached);
        try {
          const res = await fetchWithTimeout("/api/ai/analyze", { method: "POST", body: form, timeoutMs: 60000 });
          const json = await res.json();
          if (res.ok && json?.content) content = json.content as string;
        } catch {}
        if (!content) {
          // Fallback for images: use vision QA
          try {
            const data64 = await (async () => {
              const ab = await attached.arrayBuffer();
              const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
              return `data:${attached.type};base64,${b64}`;
            })();
            const res3 = await fetchWithTimeout("/api/translate-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ images: [data64], mode: "qa", question }),
              timeoutMs: 60000,
            });
            const json3 = await res3.json();
            if (res3.ok && json3?.translated) content = json3.translated as string;
          } catch {}
        }
      }
      if (!content) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't read any structured details from the attachment. You may continue answering the questions manually." }]);
        return;
      }
      // Attempt to locate JSON in the content
      let parsed: unknown = null;
      try {
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        const jsonSlice = start >= 0 && end > start ? content.slice(start, end + 1) : content;
        parsed = JSON.parse(jsonSlice);
      } catch {
        // As last resort, ask server to convert to JSON using process-text
        try {
          const res = await fetchWithTimeout("/api/ai/process-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: content,
              mode: "chat",
              question: "Output ONLY JSON with keys: fullName, policyNo, passportNo, destinationCountry, phone, email, departureDate, returnDate, airline, claimTypes, otherClaimDetail, incidentDateTime, incidentLocation, incidentDescription, bankName, accountNo, accountName, signatureDate.",
            }),
            timeoutMs: 60000,
          });
          const j = await res.json();
          if (res.ok && j?.content) {
            const s = j.content as string;
            const st = s.indexOf("{");
            const en = s.lastIndexOf("}");
            const slice = st >= 0 && en > st ? s.slice(st, en + 1) : s;
            parsed = JSON.parse(slice);
          }
        } catch {}
      }
      if (!parsed || typeof parsed !== "object") {
        setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't get a clean JSON from the attachment. Please continue manually." }]);
        return;
      }
      const obj = parsed as Record<string, unknown>;
      const pick = (k: string) => {
        const v = obj[k];
        return typeof v === "string" ? v : undefined;
      };
      const next: TravelClaimDraft = { ...formDraft };
      next.fullName = pick("fullName") ?? next.fullName;
      next.policyNo = pick("policyNo") ?? next.policyNo;
      next.passportNo = pick("passportNo") ?? next.passportNo;
      next.destinationCountry = pick("destinationCountry") ?? next.destinationCountry;
      next.phone = pick("phone") ?? next.phone;
      next.email = pick("email") ?? next.email;
      next.departureDate = pick("departureDate") ?? next.departureDate;
      next.returnDate = pick("returnDate") ?? next.returnDate;
      next.airline = pick("airline") ?? next.airline;
      next.claimTypes = pick("claimTypes") ?? next.claimTypes;
      next.otherClaimDetail = pick("otherClaimDetail") ?? next.otherClaimDetail;
      next.incidentDateTime = pick("incidentDateTime") ?? next.incidentDateTime;
      next.incidentLocation = pick("incidentLocation") ?? next.incidentLocation;
      next.incidentDescription = pick("incidentDescription") ?? next.incidentDescription;
      next.bankName = pick("bankName") ?? next.bankName;
      next.accountNo = pick("accountNo") ?? next.accountNo;
      next.accountName = pick("accountName") ?? next.accountName;
      next.signatureDate = pick("signatureDate") ?? next.signatureDate;
      setFormDraft(next);
      const filledKeys = Object.keys(obj).filter((k) => typeof obj[k] === "string").slice(0, 8); // preview few keys
      setMessages((prev) => [...prev, { role: "assistant", content: `I pre-filled some fields from the attachment: ${filledKeys.join(", ") || "-"}. Review the preview below.` }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Attachment analysis failed: ${(e as Error).message}` }]);
    }
  };
  const listRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // removed: downscaleDataUrl (no longer needed without client pdf.js OCR)

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
        // No client-side pdf.js fallback to avoid deployment issues. If server failed, surface error below.
        if (res.ok && data?.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${data?.error || "Failed to process attachment."}` },
          ]);
        }
      } else if (mode === "form") {
        // Form Assist flow
        const trimmed = input.trim();
        // Start flow
        if (!formActive) {
          setFormActive(true);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Let’s submit your travel claim. I’ll ask a few questions. You can type answers, and add attachments with the Attach button. First: " + steps[0].label } as ChatMessage,
          ]);
          setInput("");
          setLoading(false);
          return;
        }
        // Record answer for current step
        const current = steps[formStep];
        if (current) {
          setFormDraft((prev) => ({ ...prev, [current.key]: trimmed }));
          const nextStep = formStep + 1;
          setFormStep(nextStep);
          if (nextStep < steps.length) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `Got it. Next: ${steps[nextStep].label}` } as ChatMessage,
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "All set. Please review the preview below and press Submit when ready. You can correct any field by typing: set <field>=<value> (e.g., set phone=0123456789)." } as ChatMessage,
            ]);
          }
          setInput("");
          setLoading(false);
          return;
        }
        // Fallback
        setLoading(false);
        return;
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
              <select value={mode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as "chat" | "summarize" | "translate" | "form")} aria-label="Mode" className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
                <option value="chat">Chat</option>
                <option value="summarize">Summarize</option>
                <option value="translate">Translate</option>
                <option value="form">Form Assist</option>
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
                <input type="file" accept="image/*,application/pdf,text/*" capture="environment" className="hidden" onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0] || null;
                  if (mode === "form" && f) {
                    setFormDraft((prev) => ({ ...prev, attachmentsOther: [...(prev.attachmentsOther || []), f] }));
                    // Show acknowledgement message
                    setMessages((prev) => [...prev, { role: "assistant", content: `Attached file: ${f.name}. Trying to pre-fill details...` }]);
                    await extractFieldsFromFile(f);
                    e.target.value = "";
                    return;
                  }
                  setFile(f);
                }} aria-label="Upload attachment" />
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
          {mode === "form" && (
            <div className="mt-4 rounded-2xl border border-white/30 bg-white/10 p-4">
              <h3 className="font-semibold">Form Assist Preview</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p><span className="opacity-80">Full Name:</span> {formDraft.fullName || "-"}</p>
                <p><span className="opacity-80">Policy No.:</span> {formDraft.policyNo || "-"}</p>
                <p><span className="opacity-80">Passport No.:</span> {formDraft.passportNo || "-"}</p>
                <p><span className="opacity-80">Destination:</span> {formDraft.destinationCountry || "-"}</p>
                <p><span className="opacity-80">Phone:</span> {formDraft.phone || "-"}</p>
                <p><span className="opacity-80">Email:</span> {formDraft.email || "-"}</p>
                <p><span className="opacity-80">Departure:</span> {formDraft.departureDate || "-"}</p>
                <p><span className="opacity-80">Return:</span> {formDraft.returnDate || "-"}</p>
                <p><span className="opacity-80">Airline:</span> {formDraft.airline || "-"}</p>
                <p className="sm:col-span-2"><span className="opacity-80">Claim Types:</span> {formDraft.claimTypes || "-"}</p>
                <p className="sm:col-span-2"><span className="opacity-80">Other Claim Detail:</span> {formDraft.otherClaimDetail || "-"}</p>
                <p><span className="opacity-80">Incident:</span> {formDraft.incidentDateTime || "-"}</p>
                <p><span className="opacity-80">Location:</span> {formDraft.incidentLocation || "-"}</p>
                <p className="sm:col-span-2 whitespace-pre-wrap"><span className="opacity-80">Description:</span> {formDraft.incidentDescription || "-"}</p>
                <p><span className="opacity-80">Bank:</span> {formDraft.bankName || "-"}</p>
                <p><span className="opacity-80">Account No.:</span> {formDraft.accountNo || "-"}</p>
                <p><span className="opacity-80">Account Name:</span> {formDraft.accountName || "-"}</p>
                <p><span className="opacity-80">Signature Date:</span> {formDraft.signatureDate || "-"}</p>
                <p className="sm:col-span-2"><span className="opacity-80">Attachments (other):</span> {(formDraft.attachmentsOther || []).map((f) => f.name).join(", ") || "None"}</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-sm text-fuchsia-700 ring-1 ring-fuchsia-100"
                  onClick={async () => {
                    // Build FormData and submit to /api/travel-claim
                    const fd = new FormData();
                    Object.entries(formDraft).forEach(([k, v]) => {
                      if (k === "attachmentsOther") return;
                      if (typeof v === "string") fd.set(k, v);
                    });
                    (formDraft.attachmentsOther || []).forEach((f) => fd.append("otherDocs", f));
                    setLoading(true);
                    try {
                      const res = await fetch("/api/travel-claim", { method: "POST", body: fd });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.error || "Submission failed");
                      setMessages((prev) => [...prev, { role: "assistant", content: `Submitted! Reference: ${json?.id || "-"}. You can view it in Submitted Claims.` }]);
                      setFormActive(false);
                      setFormStep(0);
                      setFormDraft({ attachmentsOther: [] });
                    } catch (e) {
                      setMessages((prev) => [...prev, { role: "assistant", content: `Error submitting: ${(e as Error).message}` }]);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Submit Claim
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/20"
                  onClick={() => {
                    setFormActive(false);
                    setFormStep(0);
                    setFormDraft({ attachmentsOther: [] });
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


