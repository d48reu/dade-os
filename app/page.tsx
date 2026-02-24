'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TerminalPanel from './components/TerminalPanel';
import StatusBar from './components/StatusBar';
import DataSelector from './components/DataSelector';
import ProjectFolders from './components/ProjectFolders';
import DataReadout from './components/DataReadout';
import WeatherStrip from './components/WeatherStrip';
import AlertFeed from './components/AlertFeed';

// Dynamic import for Three.js (no SSR)
const WireframeCityscape = dynamic(() => import('./components/WireframeCityscape'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-xs tracking-[0.2em] uppercase animate-pulse-glow" style={{ color: '#FF6600' }}>
        LOADING 3D ENGINE...
      </span>
    </div>
  ),
});

export default function CommandCenter() {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#000' }}>
      {/* === TOP BAR === */}
      <div className="flex items-center justify-between px-4 py-1 border-b" style={{ borderColor: '#993D00' }}>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
            EDITING PARAMETER
          </span>
          <span className="text-[10px] tracking-[0.15em]" style={{ color: '#993D00' }}>|</span>
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
            GEOGRAPHIC REFERENCE: MIAMI-DADE COUNTY, FL
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
            LAT 25.7617° N
          </span>
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
            LNG 80.1918° W
          </span>
        </div>
      </div>

      {/* === WEATHER + ALERTS ROW === */}
      <div className="flex gap-2 p-2" style={{ height: '140px' }}>
        <TerminalPanel title="ATMOSPHERIC — MIAMI-DADE" className="w-96">
          <WeatherStrip />
        </TerminalPanel>
        <TerminalPanel title="PUBLIC SAFETY — LIVE FEED" className="flex-1">
          <AlertFeed />
        </TerminalPanel>
      </div>

      {/* === MAIN CONTENT ROW === */}
      <div className="flex-1 flex gap-2 px-2 min-h-0">
        {/* 3D Cityscape — hero element */}
        <TerminalPanel title="3D WIREFRAME — DOWNTOWN MIAMI" className="flex-1">
          <WireframeCityscape activeOverlay={activeOverlay} />
        </TerminalPanel>

        {/* Right sidebar — data selector */}
        <TerminalPanel title="DATA OVERLAY" className="w-52" dim>
          <DataSelector activeOverlay={activeOverlay} onOverlayChange={setActiveOverlay} />
        </TerminalPanel>
      </div>

      {/* === MIDDLE LABEL BAR === */}
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-sm tracking-[0.3em] uppercase glow-amber-bright" style={{ color: '#FF8800' }}>
          DADE/OS
        </span>
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
          USER: OPERATOR_01 — CLEARANCE: LEVEL_3
        </span>
      </div>

      {/* === BOTTOM ROW === */}
      <div className="flex gap-2 px-2 pb-2" style={{ height: '120px' }}>
        {/* Project folders */}
        <TerminalPanel title="PROJECT WORKSPACE" className="flex-1">
          <ProjectFolders />
        </TerminalPanel>

        {/* Data readout */}
        <TerminalPanel title="SYSTEM LOG" className="w-80">
          <DataReadout />
        </TerminalPanel>
      </div>

      {/* === STATUS BAR === */}
      <StatusBar />
    </div>
  );
}
