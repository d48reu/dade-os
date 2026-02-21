"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  ts: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const WELCOME: Message = {
  role: "system",
  ts: now(),
  content:
    "DADE/OS online. Ask about Miami-Dade zoning, flood zones, transit, 311, county budget, GIS data, or anything civic.",
};

const MONO: React.CSSProperties = {
  fontFamily: "'Share Tech Mono', 'Courier New', monospace",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageRow({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  const labelColor = isUser ? "#00ff41" : isSystem ? "#1a5a2a" : "#00cc33";
  const labelGlow = isUser
    ? "0 0 6px #00ff41"
    : isSystem
      ? "none"
      : "0 0 6px #00cc33";
  const textColor = isUser ? "#33aa44" : isSystem ? "#1a4a2a" : "#00cc33";
  const label = isUser ? "YOU" : isSystem ? "SYS" : "DADE/OS";

  return (
    <div className="flex gap-3 text-xs leading-relaxed" style={MONO}>
      {/* Timestamp */}
      <span
        className="flex-shrink-0 select-none"
        style={{ color: "#0a2a0a", minWidth: "2.8em" }}
      >
        {msg.ts}
      </span>

      {/* Label */}
      <span
        className="flex-shrink-0 font-bold select-none"
        style={{
          color: labelColor,
          textShadow: labelGlow,
          minWidth: "5em",
          letterSpacing: "0.08em",
        }}
      >
        {label}&nbsp;›
      </span>

      {/* Content */}
      <span
        style={{
          color: textColor,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          flex: 1,
          textShadow: isSystem ? "none" : `0 0 4px ${textColor}`,
        }}
      >
        {msg.content}
      </span>
    </div>
  );
}

function StreamingRow({ text }: { text: string }) {
  return (
    <div className="flex gap-3 text-xs leading-relaxed" style={MONO}>
      <span
        className="flex-shrink-0 select-none"
        style={{ color: "#0a2a0a", minWidth: "2.8em" }}
      >
        {now()}
      </span>
      <span
        className="flex-shrink-0 font-bold select-none"
        style={{
          color: "#00cc33",
          textShadow: "0 0 6px #00cc33",
          minWidth: "5em",
          letterSpacing: "0.08em",
        }}
      >
        DADE/OS&nbsp;›
      </span>
      <span
        style={{
          color: "#00cc33",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          flex: 1,
          textShadow: "0 0 4px #00cc33",
        }}
      >
        {text}
        <span
          style={{
            animation: "blink 0.5s step-end infinite",
            color: "#00ff41",
            textShadow: "0 0 6px #00ff41",
          }}
        >
          █
        </span>
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages or stream text update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Auto-resize textarea
  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text, ts: now() };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setStreamText("");
    setError(null);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Only send user/assistant turns to the API (strip system messages)
    const apiMessages = nextMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamText(full);
      }

      // Commit the completed response as a message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: full, ts: now() },
      ]);
      setStreamText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <Navigation />

      {/* Full-height container below nav */}
      <div className="flex-1 p-2 min-h-0 flex flex-col">
        {/*
          Custom panel — NOT using RetroWindow because we need the input bar
          pinned outside the scrollable message area.
        */}
        <div className="retro-panel corner-accents flex flex-col flex-1 min-h-0">

          {/* ── Title bar ── */}
          <div className="panel-titlebar flex-shrink-0">
            <div className="flex items-center gap-3">
              {streaming && <span className="status-dot live" />}
              <span className="panel-title">AI Chat — DADE/OS</span>
              <span className="badge badge-blue">
                {streaming ? "RECEIVING" : "CLAUDE"}
              </span>
            </div>
            <div className="panel-controls">
              <div className="panel-dot close" />
              <div className="panel-dot minimize" />
              <div className="panel-dot expand" />
            </div>
          </div>

          {/* ── Message list (scrollable) ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#0a2a0a transparent" }}
          >
            {messages.map((msg, i) => (
              <MessageRow key={i} msg={msg} />
            ))}

            {/* Live streaming row */}
            {streaming && <StreamingRow text={streamText} />}

            {/* Error */}
            {error && (
              <div className="flex gap-3 text-xs" style={MONO}>
                <span style={{ color: "#0a2a0a", minWidth: "2.8em" }}>{now()}</span>
                <span style={{ color: "#ff4466", textShadow: "0 0 6px #ff4466", minWidth: "5em" }}>
                  ERR&nbsp;›
                </span>
                <span style={{ color: "#ff4466" }}>{error}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar (pinned) ── */}
          <div
            className="flex-shrink-0 flex items-end gap-2 px-3 py-2"
            style={{
              borderTop: "1px solid #0a2a0a",
              background: "rgba(0,255,65,0.015)",
            }}
          >
            <span
              className="flex-shrink-0 pb-1"
              style={{
                color: streaming ? "#1a3a1a" : "#00ff41",
                textShadow: streaming ? "none" : "0 0 6px #00ff41",
                ...MONO,
                fontSize: 14,
              }}
            >
              ›
            </span>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              placeholder={streaming ? "receiving..." : "Ask about Miami-Dade…  (Enter to send, Shift+Enter for newline)"}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none"
              style={{
                ...MONO,
                fontSize: 12,
                color: "#33aa44",
                caretColor: "#00ff41",
                letterSpacing: "0.04em",
                lineHeight: 1.6,
                minHeight: "1.6em",
                maxHeight: 120,
                overflowY: "auto",
                // placeholder color via CSS var trick
              }}
            />

            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="flex-shrink-0 badge badge-blue px-3 py-1 mb-0.5 transition-opacity"
              style={{
                ...MONO,
                fontSize: 9,
                letterSpacing: "0.15em",
                opacity: streaming || !input.trim() ? 0.3 : 1,
                cursor: streaming || !input.trim() ? "default" : "pointer",
              }}
            >
              {streaming ? "WAIT" : "SEND"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
