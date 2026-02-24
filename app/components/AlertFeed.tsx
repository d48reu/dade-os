'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchNOAAAlerts, fetchFireCalls, type NOAAAlert, type FireCall } from '../lib/alerts';

interface AlertItem {
  id: string;
  time: string;
  label: string;
  detail: string;
  severity: 'high' | 'med' | 'low';
  source: 'NOAA' | 'MDFR';
}

function noaaSeverity(s: string): 'high' | 'med' | 'low' {
  if (s === 'Extreme' || s === 'Severe') return 'high';
  if (s === 'Moderate') return 'med';
  return 'low';
}

function fireSeverity(type: string): 'high' | 'med' | 'low' {
  const t = type.toUpperCase();
  if (t.includes('FIRE') || t.includes('EXPLOS') || t.includes('HAZMAT') || t.includes('RESCUE')) return 'high';
  if (t.includes('ACCIDENT') || t.includes('TRAFFIC') || t.includes('ALARM')) return 'med';
  return 'low';
}

function severityColor(s: 'high' | 'med' | 'low'): string {
  if (s === 'high') return '#FF0033';
  if (s === 'med') return '#FF8800';
  return '#993D00';
}

function severityTag(s: 'high' | 'med' | 'low'): string {
  if (s === 'high') return '!!';
  if (s === 'med') return '! ';
  return '  ';
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [status, setStatus] = useState('ACQUIRING...');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const items: AlertItem[] = [];

      // NOAA alerts
      try {
        const noaa = await fetchNOAAAlerts();
        for (const a of noaa) {
          const onset = new Date(a.onset);
          items.push({
            id: `noaa-${a.id}`,
            time: onset.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            label: a.event.toUpperCase(),
            detail: a.headline || '',
            severity: noaaSeverity(a.severity),
            source: 'NOAA',
          });
        }
      } catch {
        // NOAA failed silently
      }

      // MDFR fire calls
      try {
        const calls = await fetchFireCalls();
        for (const c of calls) {
          items.push({
            id: `mdfr-${c.time}-${c.address}`,
            time: c.time.slice(0, 5),
            label: c.type.toUpperCase(),
            detail: `${c.address} [${c.units}]`,
            severity: fireSeverity(c.type),
            source: 'MDFR',
          });
        }
      } catch {
        // MDFR failed silently
      }

      // Sort: high severity first, then by time descending
      items.sort((a, b) => {
        const sev = { high: 0, med: 1, low: 2 };
        if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
        return b.time.localeCompare(a.time);
      });

      if (mounted) {
        setAlerts(items);
        setStatus(items.length > 0 ? `${items.length} ACTIVE` : 'ALL CLEAR');
      }
    };

    load();
    const interval = setInterval(load, 60_000); // refresh every 60s
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Auto-scroll slowly through alerts
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || alerts.length <= 3) return;

    let scrollPos = 0;
    const interval = setInterval(() => {
      scrollPos += 0.5;
      if (scrollPos >= el.scrollHeight - el.clientHeight) {
        scrollPos = 0;
      }
      el.scrollTop = scrollPos;
    }, 80);

    // Pause auto-scroll on hover
    const pause = () => clearInterval(interval);
    el.addEventListener('mouseenter', pause);

    return () => {
      clearInterval(interval);
      el.removeEventListener('mouseenter', pause);
    };
  }, [alerts]);

  return (
    <div className="flex flex-col h-full text-[11px] tracking-[0.05em]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1" style={{ borderBottom: '1px solid rgba(153,61,0,0.4)' }}>
        <span style={{ color: '#993D00' }}>NOAA + MDFR LIVE</span>
        <span style={{ color: alerts.some(a => a.severity === 'high') ? '#FF0033' : '#993D00' }}>
          {status}
        </span>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-hidden px-2 py-1">
        {alerts.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span style={{ color: '#993D00' }}>{status === 'ACQUIRING...' ? 'SCANNING...' : 'NO ACTIVE ALERTS'}</span>
          </div>
        )}

        {alerts.map((a) => (
          <div
            key={a.id}
            className="py-1 leading-snug"
            style={{ borderBottom: '1px solid rgba(153,61,0,0.15)' }}
          >
            <div className="flex items-start gap-2">
              <span style={{ color: severityColor(a.severity) }} className="shrink-0">
                {severityTag(a.severity)}
              </span>
              <span style={{ color: '#993D00' }} className="shrink-0">{a.time}</span>
              <span style={{ color: a.severity === 'high' ? '#FF0033' : a.severity === 'med' ? '#FF8800' : '#FF6600' }} className="truncate">
                {a.label}
              </span>
              <span style={{ color: '#993D00' }} className="shrink-0">[{a.source}]</span>
            </div>
            <div className="pl-6 truncate text-[10px]" style={{ color: '#993D00' }}>
              {a.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
