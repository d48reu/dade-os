'use client';

const categories = [
  { id: 'transit', label: 'TRANSIT', icon: '[ T ]', status: 'LIVE' },
  { id: 'zoning', label: 'ZONING', icon: '[ Z ]', status: 'STUB' },
  { id: 'infrastructure', label: 'INFRASTRUCTURE', icon: '[ I ]', status: 'STUB' },
  { id: 'safety', label: 'PUBLIC SAFETY', icon: '[ S ]', status: 'STUB' },
  { id: 'environment', label: 'ENVIRONMENT', icon: '[ E ]', status: 'STUB' },
];

interface DataSelectorProps {
  activeOverlay: string | null;
  onOverlayChange: (id: string | null) => void;
}

export default function DataSelector({ activeOverlay, onOverlayChange }: DataSelectorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((cat) => {
          const isActive = activeOverlay === cat.id;
          const isLive = cat.status === 'LIVE';
          return (
            <button
              key={cat.id}
              onClick={() => onOverlayChange(isActive ? null : cat.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs tracking-[0.1em] transition-colors"
              style={{
                color: isActive ? '#FF8800' : isLive ? '#FF6600' : '#993D00',
                background: isActive ? 'rgba(255, 102, 0, 0.08)' : 'transparent',
              }}
            >
              <span className="font-mono text-[10px]" style={{ color: isActive ? '#00FF41' : '#993D00' }}>
                {isActive ? '>' : ' '}
              </span>
              <span className="font-mono text-[10px]" style={{ color: isActive ? '#FF8800' : '#993D00' }}>
                {cat.icon}
              </span>
              <span className="flex-1">{cat.label}</span>
              {isLive && (
                <span className="text-[8px] tracking-[0.05em]" style={{ color: isActive ? '#00FF41' : '#993D00' }}>
                  {isActive ? 'ON' : 'READY'}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-2 py-1 text-[9px] tracking-[0.1em] border-t" style={{ borderColor: 'rgba(153,61,0,0.5)', color: '#993D00' }}>
        {activeOverlay ? `LAYER: ${activeOverlay.toUpperCase()}` : 'NO OVERLAY ACTIVE'}
      </div>
    </div>
  );
}
