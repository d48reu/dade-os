'use client';

const projects = [
  { id: 'A', label: 'MIAMI21-TRANSLATOR' },
  { id: 'B', label: 'COMMISSION-SEARCH' },
  { id: 'C', label: 'GIS-EXPLORER' },
  { id: 'D', label: 'DATA-FEEDS' },
];

export default function ProjectFolders() {
  return (
    <div className="flex items-stretch gap-2 h-full p-2">
      {projects.map((proj) => (
        <button
          key={proj.id}
          className="flex-1 panel-dim flex flex-col items-center justify-center gap-1 p-2 transition-colors hover:border-amber"
          style={{ minWidth: 0 }}
          title={proj.label}
        >
          {/* Folder icon ASCII art */}
          <div className="text-[10px] leading-none" style={{ color: '#993D00' }}>
            <div>{'  ___'}</div>
            <div>{'|     |'}</div>
            <div>{'|_____|'}</div>
          </div>
          <span className="text-[11px] tracking-[0.15em] glow-amber" style={{ color: '#FF6600' }}>
            {proj.id}
          </span>
          <span className="text-[8px] tracking-[0.05em] truncate w-full text-center" style={{ color: '#993D00' }}>
            {proj.label}
          </span>
        </button>
      ))}
    </div>
  );
}
