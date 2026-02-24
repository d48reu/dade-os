'use client';

import { useState, useEffect, useRef } from 'react';

const sampleLines = [
  '> INIT DADE/OS v0.1.0',
  '> CONNECTING TO GIS SERVICES...',
  '> ARCGIS REST API: ONLINE',
  '> BUILDING FOOTPRINT 2D: READY',
  '> QUERYING DOWNTOWN BBOX...',
  '>   XMIN: -80.205  YMIN: 25.760',
  '>   XMAX: -80.185  YMAX: 25.780',
  '> FEATURES LOADED: 500',
  '> EXTRUDING GEOMETRY...',
  '> WIREFRAME RENDER: ACTIVE',
  '> ---',
  '> SAMPLE RECORD:',
  '>   OBJECTID: 14523',
  '>   SHAPE_AREA: 2847.32 sqft',
  '>   SHAPE_LENGTH: 213.7 ft',
  '>   HEIGHT_EST: 16.0 units',
  '> ---',
  '> MIAMI-DADE COUNTY GIS OPEN DATA',
  '> CIVIC DATA INTERFACE READY',
  '> AWAITING OPERATOR INPUT...',
  '> _',
];

export default function DataReadout() {
  const [lines, setLines] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < sampleLines.length) {
        const line = sampleLines[i];
        i++;
        setLines((prev) => [...prev, line]);
      } else {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={ref} className="h-full overflow-y-auto p-2 text-[10px] leading-relaxed" style={{ color: '#FF6600' }}>
      {lines.map((line, i) => (
        <div key={i} className={i === lines.length - 1 && line?.endsWith('_') ? 'animate-pulse-glow' : ''}>
          {line}
        </div>
      ))}
    </div>
  );
}
