'use client';

interface TerminalPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  dim?: boolean;
}

export default function TerminalPanel({ title, children, className = '', dim = false }: TerminalPanelProps) {
  return (
    <div className={`${dim ? 'panel-dim' : 'panel'} panel-brackets flex flex-col ${className}`}>
      {/* Bottom brackets layer */}
      <div className="panel-brackets-bottom absolute inset-0 pointer-events-none" />

      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-amber-dim/50" style={{ borderColor: dim ? '#993D00' : 'rgba(255,102,0,0.3)' }}>
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: dim ? '#993D00' : '#FF8800' }}>
          {title}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
