"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Command Center" },
  { href: "/projects", label: "Projects" },
  { href: "/data", label: "Data" },
  { href: "/chat", label: "Chat" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar z-50">
      {/* Logo */}
      <Link href="/" className="nav-logo" style={{ textDecoration: "none" }}>
        DADE<span>/OS</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right: live indicator */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-dade-dim text-xs tracking-widest">
          MIAMI-DADE CO.&nbsp;&nbsp;
          <span className="text-dade-dim">25.7617° N&nbsp;</span>
          <span className="text-dade-dim">80.1918° W</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="status-dot live" />
          <span className="text-dade-green text-xs tracking-widest glow-green">
            ONLINE
          </span>
        </div>
      </div>
    </nav>
  );
}
