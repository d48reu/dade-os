"use client";

import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_W = 1200;
const SVG_H = 680;
const SQ3 = Math.sqrt(3);
const STEP = 65; // horizontal spacing between parallel lines (px)
// Each grid line runs from (x0, SVG_H) to (x0 ± SVG_H*√3, 0)
// → length = √((SVG_H·√3)² + SVG_H²) = SVG_H·√(3+1) = 2·SVG_H
const LINE_LEN = Math.ceil(SVG_H * 2) + 8; // 1368

const HEADER_TEXT = "DADE/OS v0.1.0 // INITIALIZING...";

const STATUS_LINES = [
  "KERNEL LOADED",
  "GIS API ONLINE",
  "MAP FEED ACTIVE",
  "AI ENGINE STANDBY",
];

// Simplified Miami-Dade county silhouette — clockwise from NW corner.
// Placed in a ~450×540 box centered in the SVG (~600, ~340).
const COUNTY_PATH = [
  "M 355 92",   // NW — Krome Ave / Broward county line
  "L 785 76",   // NE — Atlantic coast / Broward line
  "L 828 198",  // East upper coast (Fort Lauderdale / Aventura belt)
  "L 838 335",  // Biscayne Bay / Miami
  "L 808 432",  // South Miami / Homestead approach
  "L 758 515",  // Homestead / Card Sound Rd
  "L 698 564",  // Turkey Point / Card Sound
  "L 628 598",  // Southernmost point (toward Everglades City)
  "L 556 574",  // Florida Bay / Whitewater Bay
  "L 450 514",  // Everglades NP western shore
  "L 415 382",  // Western boundary mid (Krome Ave corridor)
  "L 412 242",  // Western boundary upper
  "Z",
].join(" ");

// ─── Grid Generation ──────────────────────────────────────────────────────────

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildGrid(): Line[] {
  const dx = SVG_H * SQ3; // horizontal run of each line
  const lines: Line[] = [];

  // Direction 1: bottom-left → top-right (↗)
  for (let x0 = -dx; x0 < SVG_W + STEP; x0 += STEP) {
    lines.push({ x1: x0, y1: SVG_H, x2: x0 + dx, y2: 0 });
  }

  // Direction 2: bottom-right → top-left (↖)
  for (let x0 = 0; x0 < SVG_W + dx + STEP; x0 += STEP) {
    lines.push({ x1: x0, y1: SVG_H, x2: x0 - dx, y2: 0 });
  }

  // Sort by midpoint-X → animation sweeps left-to-right across screen
  return lines.sort((a, b) => (a.x1 + a.x2) / 2 - (b.x1 + b.x2) / 2);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  // phase: 0=cursor, 1=type header, 2=grid, 3=county, 4=statuses, 5=ready
  const [phase, setPhase] = useState(0);
  const [headerText, setHeaderText] = useState("");
  const [completedStatuses, setCompletedStatuses] = useState<string[]>([]);
  const [activeStatus, setActiveStatus] = useState("");
  const [showReady, setShowReady] = useState(false);
  const [fading, setFading] = useState(false);

  // Build grid once — stable across re-renders
  const lines = useRef(buildGrid()).current;
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ─── Phase timeline ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = (ms: number, fn: () => void) => setTimeout(fn, ms);
    const timers = [
      t(500,  () => setPhase(1)),                              // type header
      t(1000, () => setPhase(2)),                              // draw grid
      t(2000, () => setPhase(3)),                              // trace county
      t(3000, () => setPhase(4)),                              // type statuses
      t(4500, () => { setShowReady(true); setPhase(5); }),     // SYSTEM READY
      t(5000, () => setFading(true)),                          // fade out
      t(5700, () => onCompleteRef.current()),                  // done
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Header typewriter ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase < 1) return;
    let i = 0;
    const id = setInterval(() => {
      setHeaderText(HEADER_TEXT.slice(0, ++i));
      if (i >= HEADER_TEXT.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [phase]);

  // ─── Status typewriter ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase < 4) return;
    let cancelled = false;

    function type(li: number, ci: number) {
      if (cancelled) return;
      if (li >= STATUS_LINES.length) return;
      const line = STATUS_LINES[li];
      if (ci <= line.length) {
        setActiveStatus(line.slice(0, ci));
        setTimeout(() => type(li, ci + 1), 22);
      } else {
        setCompletedStatuses((prev) => [...prev, line]);
        setActiveStatus("");
        if (li + 1 < STATUS_LINES.length) {
          setTimeout(() => type(li + 1, 0), 110);
        }
      }
    }

    type(0, 0);
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // ─── Derived values ──────────────────────────────────────────────────────
  const STAGGER_MS = 700; // total window across which all lines are staggered
  const gridActive = phase >= 2;
  const GLOW = "0 0 8px #00ff41, 0 0 20px #00cc33";
  const MONO = { fontFamily: "'Share Tech Mono', 'Courier New', monospace" };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center
        transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
      style={{ background: "#020d02" }}
    >
      {/* Injected keyframes — LINE_LEN embedded so dashoffset matches exactly */}
      <style>{`
        @keyframes draw-iso-line {
          from { stroke-dashoffset: ${LINE_LEN}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes trace-dade-county {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ready-flash {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes ls-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>

      {/* CRT scanlines on top of everything */}
      <div className="crt-overlay" aria-hidden="true" />

      {/* ── SVG layer — isometric grid + county outline ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* Soft phosphor glow on grid lines */}
          <filter id="ls-line-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stronger glow on county outline */}
          <filter id="ls-county-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip lines to viewBox bounds */}
          <clipPath id="ls-viewport">
            <rect x="0" y="0" width={SVG_W} height={SVG_H} />
          </clipPath>
        </defs>

        {/* Isometric grid — all lines start invisible, animate in L→R */}
        <g clipPath="url(#ls-viewport)" filter="url(#ls-line-glow)">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#00ff41"
              strokeWidth="1"
              strokeOpacity="0.52"
              strokeDasharray={LINE_LEN}
              style={{
                strokeDashoffset: LINE_LEN,
                ...(gridActive && {
                  animation: "draw-iso-line 0.45s forwards linear",
                  animationDelay: `${(i / lines.length) * STAGGER_MS}ms`,
                }),
              }}
            />
          ))}
        </g>

        {/* Miami-Dade county outline — traces itself over the grid */}
        {phase >= 3 && (
          <path
            d={COUNTY_PATH}
            fill="none"
            stroke="#00ff41"
            strokeWidth="2.5"
            strokeLinejoin="miter"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            filter="url(#ls-county-glow)"
            style={{
              animation: "trace-dade-county 1.4s forwards ease-in-out",
            }}
          />
        )}

        {/* Corner tick marks on county path for that "surveyed" look */}
        {phase >= 3 && (
          <g stroke="#00ff41" strokeWidth="1" opacity="0.4">
            <line x1="348" y1="85" x2="360" y2="85" />
            <line x1="348" y1="85" x2="348" y2="100" />
            <line x1="785" y1="70" x2="795" y2="70" />
            <line x1="795" y1="70" x2="795" y2="82" />
          </g>
        )}
      </svg>

      {/* ── Text layer — sits above SVG ── */}
      <div className="relative z-10 flex flex-col items-center gap-0">

        {/* Phase 0: only a blinking block cursor */}
        {phase === 0 && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 20,
              background: "#00ff41",
              boxShadow: GLOW,
              animation: "ls-blink 1s step-end infinite",
            }}
          />
        )}

        {/* Typing header */}
        {phase >= 1 && (
          <p
            className="text-sm uppercase"
            style={{
              ...MONO,
              color: "#00ff41",
              textShadow: GLOW,
              letterSpacing: "0.2em",
              minHeight: "1.4em",
            }}
          >
            {headerText}
            {headerText.length < HEADER_TEXT.length && (
              <span
                style={{
                  animation: "ls-blink 0.5s step-end infinite",
                  color: "#00ff41",
                }}
              >
                █
              </span>
            )}
          </p>
        )}

        {/* Status lines */}
        {phase >= 4 && (
          <div
            className="flex flex-col gap-1 mt-6"
            style={{ width: 300 }}
          >
            {completedStatuses.map((line) => (
              <div
                key={line}
                className="flex items-center gap-3 uppercase"
                style={{
                  ...MONO,
                  fontSize: 11,
                  color: "#00cc33",
                  textShadow: "0 0 6px #00cc33",
                  letterSpacing: "0.18em",
                }}
              >
                <span
                  style={{
                    color: "#00ff41",
                    textShadow: "0 0 6px #00ff41",
                    flexShrink: 0,
                  }}
                >
                  ›
                </span>
                <span style={{ flex: 1 }}>{line}</span>
                <span
                  style={{
                    fontSize: 9,
                    color: "#00ff41",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 4px #00ff41",
                  }}
                >
                  [ OK ]
                </span>
              </div>
            ))}

            {/* Currently typing line */}
            {activeStatus && (
              <div
                className="flex items-center gap-3 uppercase"
                style={{
                  ...MONO,
                  fontSize: 11,
                  color: "#00cc33",
                  textShadow: "0 0 6px #00cc33",
                  letterSpacing: "0.18em",
                }}
              >
                <span
                  style={{
                    color: "#00ff41",
                    textShadow: "0 0 6px #00ff41",
                    flexShrink: 0,
                  }}
                >
                  ›
                </span>
                <span>{activeStatus}</span>
                <span
                  style={{
                    animation: "ls-blink 0.5s step-end infinite",
                    color: "#00ff41",
                  }}
                >
                  █
                </span>
              </div>
            )}
          </div>
        )}

        {/* SYSTEM READY — flashes 3× then holds */}
        {showReady && (
          <p
            className="mt-8 uppercase"
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: 22,
              fontWeight: 900,
              color: "#39ff14",
              textShadow:
                "0 0 10px #39ff14, 0 0 30px #00ff41, 0 0 60px #00cc33",
              animation: "ready-flash 0.45s ease-in-out 3 forwards",
              letterSpacing: "0.35em",
            }}
          >
            SYSTEM READY
          </p>
        )}
      </div>
    </div>
  );
}
