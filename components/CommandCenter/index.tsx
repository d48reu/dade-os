"use client";

import dynamic from "next/dynamic";
import RetroWindow from "@/components/ui/RetroWindow";
import {
  SystemStatusPanel,
  DataFeedsPanel,
  ActivityPanel,
  QuickAccessPanel,
} from "@/components/CommandCenter/TerminalPanel";

// Dynamic import — Mapbox requires browser APIs, no SSR
const MapView = dynamic(() => import("@/components/CommandCenter/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-dade-bg-alt">
      <div className="text-center">
        <div className="text-dade-blue text-xs tracking-widest mb-2 animate-pulse">
          LOADING MAP RENDERER…
        </div>
        <div className="text-dade-dim text-xs">Initializing WebGL context</div>
      </div>
    </div>
  ),
});

export default function CommandCenter() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Main grid layout ── */}
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* Left sidebar — 2 stacked panels */}
        <div className="flex flex-col gap-2 w-64 flex-shrink-0">
          <RetroWindow
            title="System Status"
            className="flex-1"
            live
            badge={{ text: "v0.1", variant: "blue" }}
          >
            <SystemStatusPanel />
          </RetroWindow>

          <RetroWindow
            title="Quick Access"
            className="flex-1"
            badge={{ text: "NAV", variant: "blue" }}
          >
            <QuickAccessPanel />
          </RetroWindow>
        </div>

        {/* Center — Map takes all remaining space */}
        <div className="flex-1 min-w-0 retro-panel overflow-hidden relative">
          {/* Map title overlay */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,5,16,0.9) 0%, transparent 100%)",
            }}
          >
            <div
              className="flex items-center gap-3"
              style={{ fontFamily: "Orbitron, monospace" }}
            >
              <span
                className="text-xs font-bold tracking-widest text-dade-blue"
                style={{ textShadow: "var(--glow-blue)" }}
              >
                TERRAIN OVERVIEW
              </span>
              <span className="badge badge-green">LIVE</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-dade-dim tracking-widest">
              <span>MIAMI-DADE COUNTY, FL</span>
              <span className="badge badge-blue">DARK-V11</span>
            </div>
          </div>

          {/* The map itself */}
          <MapView />

          {/* Bottom fade for coordinate bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(5,5,16,0.7) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Right sidebar — 2 stacked panels */}
        <div className="flex flex-col gap-2 w-72 flex-shrink-0">
          <RetroWindow
            title="Data Feeds"
            className="flex-1"
            live
            badge={{ text: "GIS", variant: "green" }}
          >
            <DataFeedsPanel />
          </RetroWindow>

          <RetroWindow
            title="Activity Log"
            className="flex-1"
            badge={{ text: "LOG", variant: "amber" }}
          >
            <ActivityPanel />
          </RetroWindow>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="status-bar">
        <span>
          <span className="status-dot live" />
          <span className="text-dade-green glow-green">SYSTEM LIVE</span>
        </span>

        <span className="status-separator">◈</span>

        <span className="text-dade-dim">
          SECTOR&nbsp;
          <span className="text-dade-text">MIAMI-DADE</span>
        </span>

        <span className="status-separator">◈</span>

        <span className="text-dade-dim">
          GRID&nbsp;
          <span className="text-dade-cyan">25.7617°N / 80.1918°W</span>
        </span>

        <span className="status-separator">◈</span>

        <span className="text-dade-dim">
          BUILD&nbsp;<span className="text-dade-blue">2026.02.20</span>
        </span>

        <span className="ml-auto text-dade-dim tracking-widest">
          DADE/OS&nbsp;·&nbsp;COMMAND CENTER&nbsp;
          <span className="text-dade-purple">α0.1</span>
        </span>
      </div>
    </div>
  );
}
