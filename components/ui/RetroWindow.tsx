"use client";

import { ReactNode } from "react";

interface RetroWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** Optional badge shown in the title bar */
  badge?: { text: string; variant?: "blue" | "green" | "amber" | "purple" };
  /** Whether to show a live indicator dot */
  live?: boolean;
}

export default function RetroWindow({
  title,
  children,
  className = "",
  badge,
  live,
}: RetroWindowProps) {
  return (
    <div className={`retro-panel flex flex-col corner-accents ${className}`}>
      {/* Title bar */}
      <div className="panel-titlebar">
        {/* Window control dots */}
        <div className="panel-controls order-last">
          <div className="panel-dot close" title="Close" />
          <div className="panel-dot minimize" title="Minimize" />
          <div className="panel-dot expand" title="Expand" />
        </div>

        {/* Title + badge */}
        <div className="flex items-center gap-3">
          {live && (
            <span>
              <span className="status-dot live inline-block" />
            </span>
          )}
          <span className="panel-title">{title}</span>
          {badge && (
            <span className={`badge badge-${badge.variant ?? "blue"}`}>
              {badge.text}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="panel-body flex-1 min-h-0">{children}</div>
    </div>
  );
}
