"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import RetroWindow from "@/components/ui/RetroWindow";

export default function ChatPage() {
  const [input, setInput] = useState("");

  return (
    <>
      <Navigation />
      <div className="flex-1 p-4 flex flex-col gap-2 min-h-0">
        <RetroWindow
          title="AI Chat — Claude Interface"
          badge={{ text: "AI", variant: "purple" }}
          className="flex-1 min-h-0"
        >
          {/* Message area */}
          <div className="h-full flex flex-col gap-3">
            <div className="flex-1 flex flex-col justify-end gap-2 overflow-auto pb-2">
              {/* Welcome message */}
              <div className="terminal-line">
                <span className="terminal-prompt">DADE/OS&nbsp;›</span>
                <span className="terminal-value">
                  Claude AI integration ready. Set ANTHROPIC_API_KEY in .env.local to activate.
                </span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">DADE/OS&nbsp;›</span>
                <span className="terminal-output">
                  I can help analyze Miami-Dade civic data, summarize commission
                  documents, and answer questions about county services.
                </span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">SYS&nbsp;›</span>
                <span className="terminal-warn">
                  AI backend not yet connected. Activate in /data settings.
                </span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="cursor" />
              </div>
            </div>

            {/* Input bar */}
            <div
              className="flex items-center gap-2 border border-dade-border p-2 focus-within:border-dade-blue transition-colors"
              style={{ background: "rgba(68,102,255,0.03)" }}
            >
              <span className="text-dade-blue text-xs">›</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Miami-Dade data…"
                className="flex-1 bg-transparent text-dade-text text-xs outline-none placeholder:text-dade-dim font-mono tracking-wide"
                style={{ fontFamily: "Share Tech Mono, monospace" }}
              />
              <button
                className="badge badge-blue px-3 py-1 hover:opacity-80 transition-opacity text-xs"
                style={{ fontFamily: "Orbitron, monospace" }}
              >
                SEND
              </button>
            </div>
          </div>
        </RetroWindow>
      </div>
    </>
  );
}
