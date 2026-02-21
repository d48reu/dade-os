# DADE/OS — Project Intelligence Document

> Retro cyberpunk civic intelligence workspace for Miami-Dade County.
> Built by Diego Abreu / Abreu Data Works LLC for Commissioner's office tools.

---

## Vision

DADE/OS is a command-center interface that makes Miami-Dade government data
feel alive. The aesthetic is phosphor-glow terminals, CRT scanlines, and dark
cyberpunk UI — inspired by classic hacker films and 80s workstations, but
running on modern civic data APIs.

The goal: give policy staff and the Commissioner's team a single workspace to
monitor data feeds, explore GIS layers, run AI-assisted document analysis, and
manage civic projects.

---

## Aesthetic Rules (ENFORCE THESE)

### Color Palette
| Token         | Hex       | Use                              |
|---------------|-----------|----------------------------------|
| `--bg`        | `#050510` | Page background (near-black)     |
| `--bg-alt`    | `#0a0a1a` | Panel backgrounds                |
| `--blue`      | `#4466ff` | Primary glow, borders, headings  |
| `--purple`    | `#aa44ff` | Accent, logo slash, badges       |
| `--cyan`      | `#00d4ff` | Data values, map overlays        |
| `--green`     | `#00ff88` | Status OK, live indicators       |
| `--amber`     | `#ffaa00` | Warnings, WIP badges             |
| `--text`      | `#a0c0ff` | Body text                        |
| `--dim`       | `#3a4a6a` | Muted / secondary text           |
| `--border`    | `#1a2a5a` | Panel borders (default)          |

### Typography
- **Body/Terminal**: `Share Tech Mono` (Google Fonts) — all monospace output
- **Headings/Labels**: `Orbitron` (Google Fonts) — titles, nav, badges
- Font sizes: tiny (10–11px) for terminal lines, 13px body, 16px+ for display
- Letter-spacing: `tracking-widest` on ALL headings and labels
- Text transform: `uppercase` on labels and nav items

### Effects
- **Phosphor glow** on text: `text-shadow: 0 0 6–20px currentColor`
- **CRT scanlines**: `repeating-linear-gradient` overlay (4px repeat)
- **Scan beam**: slow-moving luminance stripe, animated top-to-bottom
- **Vignette**: radial gradient darkening at screen edges
- **Panel glow**: `box-shadow` with blue inset + outer glow on hover
- **Corner accents**: CSS `::before/::after` pixel brackets on panels

### Layout Rules
- Always full-screen, `overflow: hidden`, no scrollbars on body
- Panels use `retro-panel` class (dark bg, blue border glow, top gradient line)
- Every panel has a `panel-titlebar` with Orbitron title + control dots
- Status bar always at the bottom (28px tall)
- Map always fills center — never shrink below 40% of viewport width

### DO NOT
- No rounded corners beyond 2px (use `rounded-none` or `rounded-sm`)
- No white backgrounds, no bright backgrounds
- No sans-serif fonts (everything is monospace or Orbitron)
- No animations faster than 0.15s (the flicker) or slower than 10s (scan beam)
- No emoji in UI (use ASCII symbols: › ◈ ■ ▲ ► ◀)

---

## Architecture

```
dade-os/
├── app/                     # Next.js 15 App Router
│   ├── layout.tsx           # Root layout: fonts, CRT overlay, body class
│   ├── globals.css          # ALL custom CSS: glow, scanlines, panel chrome
│   ├── page.tsx             # Home: Command Center
│   ├── projects/page.tsx    # Project workspace (stub → full)
│   ├── data/page.tsx        # Data connectors (stub → live feeds)
│   └── chat/page.tsx        # AI chat interface (stub → Claude API)
│
├── components/
│   ├── Navigation.tsx       # Top nav bar with logo + links
│   ├── ui/
│   │   └── RetroWindow.tsx  # Reusable panel chrome (title bar + body)
│   └── CommandCenter/
│       ├── index.tsx        # Main layout: left/center/right grid
│       ├── MapView.tsx      # Mapbox GL map (dynamic import, no SSR)
│       └── TerminalPanel.tsx # Four panel content components
│
├── .env.local               # API keys (not committed)
├── .env.example             # Template for keys
└── CLAUDE.md                # This file
```

### Key Design Decisions
- **Next.js App Router** — server components for pages, client only where needed
- **Dynamic import for Mapbox** (`ssr: false`) — WebGL requires browser APIs
- **CSS custom properties** in `:root` — use `var(--blue)` not Tailwind for effects
- **Tailwind for layout** — spacing, flex, grid, widths
- **Custom CSS for aesthetics** — all glow/CRT in `globals.css`

---

## Data Sources

| Source             | URL                                           | Auth      |
|--------------------|-----------------------------------------------|-----------|
| Miami-Dade GIS     | `gis.miamidade.gov/arcgis/rest/services`      | None      |
| Open Data Portal   | `opendata.miamidade.gov`                      | None      |
| Mapbox Tiles       | `api.mapbox.com`                              | API Token |
| Anthropic Claude   | `api.anthropic.com`                           | API Key   |

---

## Roadmap

### Phase 1 — Foundation (current)
- [x] Next.js scaffold with Tailwind
- [x] CRT/phosphor aesthetic system
- [x] Command Center home layout
- [x] Mapbox map (with token fallback)
- [x] Terminal panel components
- [x] Stub pages for /projects, /data, /chat

### Phase 2 — Live Data
- [ ] Connect Miami-Dade GIS REST endpoints
- [ ] Zoning layer toggle on map
- [ ] 311 service request feed (real-time)
- [ ] Flood zone overlay

### Phase 3 — AI Integration
- [ ] Wire /chat to Anthropic Claude API (claude-opus-4-6 or claude-sonnet-4-6)
- [ ] Document analysis (upload commission PDFs)
- [ ] Data summarization sidebar

### Phase 4 — Projects
- [ ] Project workspace CRUD
- [ ] Save map views and data snapshots
- [ ] Report generation

---

## Environment Variables

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx   # Required for map tiles
NEXT_PUBLIC_MDCGIS_BASE=https://gis.miamidade.gov/arcgis/rest/services
ANTHROPIC_API_KEY=sk-ant-xxx       # Required for AI chat
```

---

## Deployment

Target: **Render.com** (Web Service)
- Build: `npm run build`
- Start: `npm start`
- Node: 20+
- Set all env vars in Render dashboard

---

*Last updated: 2026-02-20 | DADE/OS v0.1.0-alpha*
