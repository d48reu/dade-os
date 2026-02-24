'use client';

import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-1 border-t" style={{ borderColor: '#993D00', background: '#000' }}>
      <div className="flex items-center gap-6 text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
        <span>PRODUCT INTERFACE</span>
        <span>---</span>
        <span>DADE/OS v0.1</span>
        <span>---</span>
        <span>SESSION_ACTIVE</span>
      </div>
      <div className="flex items-center gap-6 text-[10px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
        <span>{time}</span>
        <span className="glow-green" style={{ color: '#00FF41' }}>ONLINE</span>
        <button className="px-2 py-0.5 border text-[10px] tracking-[0.15em] hover:bg-amber-glow transition-colors" style={{ borderColor: '#993D00', color: '#993D00' }}>
          EXPORT
        </button>
        <button className="px-2 py-0.5 border text-[10px] tracking-[0.15em] hover:bg-amber-glow transition-colors" style={{ borderColor: '#FF0033', color: '#FF0033' }}>
          ABORT
        </button>
      </div>
    </div>
  );
}
