# Codebase Structure

**Analysis Date:** 2026-02-24

## Directory Layout

```
dade-os/
├── app/                    # Next.js App Router directory
│   ├── api/
│   │   └── fire-calls/     # Fire CAD integration endpoint
│   ├── components/         # React UI components
│   ├── lib/                # Utility functions and API wrappers
│   ├── globals.css         # Tailwind and custom styles
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   └── page.tsx            # Main CommandCenter page
├── public/                 # Static assets
├── .planning/              # GSD documentation
├── .next/                  # Next.js build output (excluded from source)
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
├── next.config.ts          # Next.js configuration
├── eslint.config.mjs       # ESLint rules
├── package.json            # Dependencies
└── README.md               # Project documentation
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router root; contains all pages, layouts, and API routes
- Contains: React components (.tsx), API routes, utility modules (.ts)
- Key files: `page.tsx` (entry point), `layout.tsx` (root wrapper), `api/` (endpoints)

**app/components/:**
- Purpose: Reusable UI components for the command center interface
- Contains: Terminal panel components, data visualization, overlays, strips
- Key files: `TerminalPanel.tsx` (container), `WireframeCityscape.tsx` (3D), `DataSelector.tsx` (overlay control)

**app/lib/:**
- Purpose: Shared utility functions and API client wrappers
- Contains: Data fetching functions, parsing logic, type definitions
- Key files: `gis.ts` (ArcGIS features), `alerts.ts`, `weather.ts`, `theme.ts`

**app/api/:**
- Purpose: Next.js API routes; server-side endpoints for data aggregation
- Contains: Route handlers using NextResponse
- Key files: `fire-calls/route.ts` (fire dispatch aggregation)

**public/:**
- Purpose: Static assets served directly by Next.js
- Contains: Images, fonts, audio (if any)

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main CommandCenter component (grid layout, state management, UI orchestration)
- `app/layout.tsx`: Root layout with metadata, fonts, global styles
- `app/api/fire-calls/route.ts`: Fire CAD data endpoint

**Configuration:**
- `tsconfig.json`: TypeScript compiler options, path aliases (`@/*` → root)
- `package.json`: Dependencies (Next.js 16, React 19, Three.js, Tailwind)
- `tailwind.config.mjs`: Tailwind configuration
- `next.config.ts`: Next.js runtime configuration
- `eslint.config.mjs`: ESLint rules

**Core Logic:**
- `app/lib/gis.ts`: ArcGIS API wrappers for buildings and transit
- `app/api/fire-calls/route.ts`: Fire CAD scraper with HTML parsing
- `app/lib/alerts.ts`: Alert data integration
- `app/lib/weather.ts`: Weather data integration
- `app/lib/theme.ts`: Theme utilities

**Components:**
- `app/components/WireframeCityscape.tsx`: Three.js 3D visualization (dynamic import, SSR disabled)
- `app/components/DataSelector.tsx`: Overlay category toggles
- `app/components/AlertFeed.tsx`: Live fire/emergency feed display
- `app/components/WeatherStrip.tsx`: Atmospheric data display
- `app/components/TerminalPanel.tsx`: Terminal window container
- `app/components/StatusBar.tsx`: Bottom status line
- `app/components/MiniMap.tsx`: Geographic reference map
- `app/components/ProjectFolders.tsx`: Project workspace UI
- `app/components/DataReadout.tsx`: System log display
- `app/components/CRTOverlay.tsx`: Retro monitor effect

**Styling:**
- `app/globals.css`: Tailwind directives and custom CSS (CRT effects, animations)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `DataSelector.tsx`, `WireframeCityscape.tsx`)
- Utilities: camelCase (e.g., `gis.ts`, `alerts.ts`, `weather.ts`, `theme.ts`)
- Routes: `route.ts` in folder structure (e.g., `api/fire-calls/route.ts`)

**Directories:**
- Feature folders: kebab-case (e.g., `fire-calls/`)
- Component groups: lowercase plural (e.g., `components/`, `api/`)

**Variables & Functions:**
- camelCase for functions and variables throughout (parseFireCAD, fetchBuildingFootprints, activeOverlay, setActiveOverlay)

**Types:**
- PascalCase for interfaces (FireCall, BuildingFeature, GeoJSONResponse, TransitLineFeature, TransitStationFeature)

## Where to Add New Code

**New Feature (e.g., zoning data overlay):**
- Primary code: `app/lib/zoning.ts` (API wrapper)
- Component: `app/components/ZoningOverlay.tsx` (if custom UI needed)
- Integration: Add fetch call in `WireframeCityscape.tsx` when activeOverlay === 'zoning'

**New Component/Module:**
- Implementation: `app/components/MyComponent.tsx`
- Props interface: Defined in same file or `app/lib/types.ts` (if shared)
- Styling: Inline Tailwind classes or `app/globals.css` for shared effects

**New API Endpoint:**
- Location: `app/api/[feature]/route.ts`
- Pattern: GET handler with error handling and caching if needed
- Return: NextResponse.json()

**Utilities & Helpers:**
- Shared helpers: `app/lib/utils.ts` (create if needed)
- Data fetching: `app/lib/[domain].ts` (gis.ts, alerts.ts, weather.ts pattern)
- Types: `app/lib/types.ts` (centralized interface definitions)

## Special Directories

**app/.next/:**
- Purpose: Next.js build output and type declarations
- Generated: Yes (by `next build`)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static files served as-is
- Generated: No
- Committed: Yes (tracked in git)

**.planning/codebase/:**
- Purpose: GSD analysis documents
- Generated: Yes (by mapper agents)
- Committed: Yes (tracked in git)

## Module Aliases

Path alias configured in `tsconfig.json`:
- `@/*` → `./` (root directory)

Usage: `import X from '@/app/lib/gis'` works as if importing from root-relative path.

## Build & Runtime

**Dev Command:** `npm run dev` (Next.js dev server, rebuilds on file changes)

**Build Command:** `npm run build` (Static/hybrid pages compiled to .next/)

**Start Command:** `npm start` (Serves optimized build)

**Lint Command:** `eslint` (Runs ESLint with next config)

---

*Structure analysis: 2026-02-24*
