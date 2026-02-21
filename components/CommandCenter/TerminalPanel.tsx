"use client";

import { useEffect, useState } from "react";

/* ── Panel: System Status ──────────────────────────────── */
export function SystemStatusPanel() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const metrics = [
    { label: "KERNEL", value: "DADE/OS v0.1.0", ok: true },
    { label: "UPTIME", value: formatUptime(uptime), ok: true },
    { label: "ENV", value: "DEVELOPMENT", ok: true },
    { label: "MAP FEED", value: "ACTIVE", ok: true },
    { label: "GIS API", value: "ONLINE", ok: true },
    { label: "AI ENGINE", value: "STANDBY", ok: null },
  ];

  return (
    <div className="space-y-1">
      {metrics.map(({ label, value, ok }) => (
        <div key={label} className="terminal-line">
          <span className="terminal-prompt">›</span>
          <span className="terminal-output w-24 flex-shrink-0">{label}</span>
          <span
            className={
              ok === true
                ? "terminal-ok"
                : ok === false
                  ? "terminal-warn"
                  : "terminal-value"
            }
          >
            {value}
          </span>
        </div>
      ))}

      <div className="divider-h" />

      <div className="terminal-line">
        <span className="terminal-prompt">$</span>
        <span className="terminal-output cursor" />
      </div>
    </div>
  );
}

/* ── Panel: Data Feeds ─────────────────────────────────── */
export function DataFeedsPanel() {
  const feeds = [
    {
      id: "MDC-GIS-001",
      name: "MD County Boundaries",
      status: "LIVE",
      ok: true,
    },
    { id: "MDC-GIS-002", name: "Zoning Districts", status: "LIVE", ok: true },
    {
      id: "MDC-GIS-003",
      name: "Transit Routes",
      status: "STALE",
      ok: false,
    },
    { id: "MDC-GIS-004", name: "Flood Zones", status: "LIVE", ok: true },
    {
      id: "MDC-311-001",
      name: "311 Service Requests",
      status: "PENDING",
      ok: null,
    },
    { id: "MDC-BUD-001", name: "Budget Open Data", status: "LIVE", ok: true },
  ];

  return (
    <div className="space-y-2">
      <div className="terminal-line text-dade-dim text-xs mb-1">
        <span className="w-28">FEED ID</span>
        <span className="flex-1">DATASET</span>
        <span>STATUS</span>
      </div>
      <div className="divider-h" />
      {feeds.map((f) => (
        <div key={f.id} className="terminal-line items-center">
          <span className="text-dade-dim w-28 flex-shrink-0 text-xs">
            {f.id}
          </span>
          <span className="terminal-output flex-1 text-xs">{f.name}</span>
          <span
            className={`text-xs font-mono ${
              f.ok === true
                ? "terminal-ok"
                : f.ok === false
                  ? "terminal-error"
                  : "terminal-warn"
            }`}
          >
            {f.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Panel: Activity Log ───────────────────────────────── */
export function ActivityPanel() {
  const now = new Date();
  const ts = (offsetMin: number) => {
    const d = new Date(now.getTime() - offsetMin * 60 * 1000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const log = [
    {
      time: ts(0),
      type: "SYS",
      msg: "Command center initialized",
      variant: "ok",
    },
    {
      time: ts(1),
      type: "MAP",
      msg: "Mapbox renderer active",
      variant: "ok",
    },
    {
      time: ts(3),
      type: "GIS",
      msg: "MD GIS endpoint reachable",
      variant: "ok",
    },
    {
      time: ts(7),
      type: "GIS",
      msg: "Zoning layer ready",
      variant: "ok",
    },
    {
      time: ts(12),
      type: "SYS",
      msg: "Session started — DADE/OS",
      variant: "value",
    },
  ];

  return (
    <div className="space-y-1">
      {log.map((entry, i) => (
        <div key={i} className="terminal-line text-xs">
          <span className="text-dade-dim flex-shrink-0">{entry.time}</span>
          <span
            className={`badge badge-${entry.variant === "ok" ? "green" : entry.variant === "warn" ? "amber" : "blue"} flex-shrink-0`}
          >
            {entry.type}
          </span>
          <span className={`terminal-${entry.variant}`}>{entry.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Panel: Quick Access ───────────────────────────────── */
export function QuickAccessPanel() {
  const links = [
    {
      key: "P",
      label: "Projects",
      desc: "Workspace manager",
      href: "/projects",
      color: "blue",
    },
    {
      key: "D",
      label: "Data",
      desc: "Miami-Dade connectors",
      href: "/data",
      color: "cyan",
    },
    {
      key: "C",
      label: "Chat",
      desc: "AI assistant",
      href: "/chat",
      color: "purple",
    },
    {
      key: "M",
      label: "Map",
      desc: "Full-screen terrain",
      href: "#map",
      color: "green",
    },
  ];

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          className="flex items-center gap-3 p-2 border border-dade-border hover:border-dade-blue transition-all duration-200 group"
          style={{ textDecoration: "none" }}
        >
          <div
            className={`w-7 h-7 flex items-center justify-center border text-xs font-bold flex-shrink-0`}
            style={{
              borderColor: `var(--${link.color === "blue" ? "blue" : link.color === "cyan" ? "cyan" : link.color === "purple" ? "purple" : "green"})`,
              color: `var(--${link.color === "blue" ? "blue" : link.color === "cyan" ? "cyan" : link.color === "purple" ? "purple" : "green"})`,
              fontFamily: "Orbitron, monospace",
            }}
          >
            {link.key}
          </div>
          <div>
            <div className="text-dade-text text-xs group-hover:text-dade-blue transition-colors">
              {link.label}
            </div>
            <div className="text-dade-dim text-xs">{link.desc}</div>
          </div>
          <span className="ml-auto text-dade-dim text-xs group-hover:text-dade-blue">
            →
          </span>
        </a>
      ))}
    </div>
  );
}
