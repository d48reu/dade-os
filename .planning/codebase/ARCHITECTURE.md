# Architecture

**Analysis Date:** 2026-02-24

## Pattern Overview

**Overall:** Next.js App Router with client-side rendering for interactive UI, server-side API routes for data fetching and integration with external services.

**Key Characteristics:**
- Hybrid rendering: Server components for layout, client components for interactive elements
- Dynamic imports for heavy 3D components (Three.js) with SSR disabled
- API route aggregates external data sources (GIS APIs, fire CAD, weather)
- In-memory caching layer for frequently accessed data
- Component-driven architecture with UI building blocks (panels, overlays, strips)

## Layers

**Presentation Layer:**
- Purpose: Terminal-style UI rendering with retro aesthetic
- Location: `app/components/`
- Contains: React components (StatusBar, MiniMap, WireframeCityscape, WeatherStrip, AlertFeed, TerminalPanel, DataSelector, ProjectFolders, DataReadout, CRTOverlay, PanoramaStrip)
- Depends on: React, Three.js (WireframeCityscape), state management via hooks
- Used by: `app/page.tsx` (main CommandCenter)

**API Layer:**
- Purpose: Fetch and aggregate data from external sources, provide unified endpoints
- Location: `app/api/`
- Contains: Route handlers that fetch fire CAD data, parse HTML, cache responses
- Depends on: External GIS APIs, Miami-Dade fire CAD system
- Used by: Client components via fetch calls

**Data/Integration Layer:**
- Purpose: Wrapper functions for external APIs (ArcGIS, fire CAD, weather)
- Location: `app/lib/`
- Contains: `gis.ts` (building footprints, transit lines/stations), `alerts.ts`, `weather.ts`, `theme.ts`
- Depends on: ArcGIS REST API, fire CAD HTML parsing
- Used by: API routes and client components

**Root Layout:**
- Purpose: Initialize fonts, apply global styling, attach CRT overlay
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Metadata, Share Tech Mono font loading, body wrapper

## Data Flow

**Fire Alerts Flow:**

1. Client component `AlertFeed` renders in top bar
2. Fetches `/api/fire-calls` endpoint
3. API route `app/api/fire-calls/route.ts` fetches from Miami-Dade fire CAD HTML page
4. HTML parser extracts call data (time, code, type, address, units, district)
5. Response cached in-memory for 30 seconds to avoid hammering source
6. Client displays live fire dispatch data in terminal format

**GIS Data Flow:**

1. Client calls functions from `app/lib/gis.ts` (e.g., fetchBuildingFootprints, fetchMetrorailStations)
2. Functions construct ArcGIS REST API queries with bbox constraints
3. Responses returned as GeoJSON FeatureCollections
4. `WireframeCityscape` component converts buildings to Three.js geometries
5. Height data scaled using FEET_TO_UNITS (0.04) or estimated from footprint area

**Data Overlay Flow:**

1. User selects category in `DataSelector` (e.g., "TRANSIT")
2. Selection state updated in `CommandCenter` via setActiveOverlay
3. `WireframeCityscape` receives activeOverlay prop
4. Component conditionally fetches and renders corresponding GIS layer

**State Management:**
- Page-level state in CommandCenter: `activeOverlay` (string | null) controls which data layer displays
- No global state management; state passed via props to child components
- API caching handled in-memory at route level

## Key Abstractions

**TerminalPanel:**
- Purpose: Reusable terminal window container with title bar and border styling
- Examples: `app/components/TerminalPanel.tsx`
- Pattern: Wrapper component for content with optional `dim` prop for reduced opacity

**GIS API Wrappers:**
- Purpose: Abstract ArcGIS feature server queries into typed functions
- Examples: `fetchBuildingFootprints()`, `fetchMetrorailStations()`, `fetchLargeBuildings()`
- Pattern: Parameterized queries with URLSearchParams, GeoJSON response typing

**FireCAD HTML Parser:**
- Purpose: Extract structured data from Miami-Dade CAD HTML table
- Examples: `parseFireCAD(html)` in `app/api/fire-calls/route.ts`
- Pattern: Regex matching for district headers and table rows, cell extraction via regex

## Entry Points

**Main Page:**
- Location: `app/page.tsx`
- Triggers: Root URL `/`
- Responsibilities: Renders CommandCenter grid layout, manages activeOverlay state, orchestrates all UI panels

**Fire Calls API:**
- Location: `app/api/fire-calls/route.ts`
- Triggers: GET request to `/api/fire-calls`
- Responsibilities: Fetch HTML from Miami-Dade fire CAD, parse call data, cache for 30 seconds, return JSON

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Apply fonts, metadata, CRT overlay effect

## Error Handling

**Strategy:** Graceful fallback with in-memory caching and stale-while-revalidate pattern

**Patterns:**
- Fire CAD route returns cached data or empty array on fetch failure (lines 32, 42)
- GIS API errors thrown and caught by client; no fallback specified yet
- Try-catch at API route level; failures don't propagate to client as errors

## Cross-Cutting Concerns

**Logging:** `console` only; no structured logging framework detected

**Validation:** Type safety via TypeScript interfaces (FireCall, BuildingFeature, GeoJSONResponse, TransitLineFeature, TransitStationFeature)

**Authentication:** None detected; open APIs (ArcGIS public REST, fire CAD public HTML)

**Caching:**
- Fire CAD: 30-second in-memory cache at API route level
- GIS data: No caching; fetched on-demand by client components
- Browser: Client relies on implicit HTTP caching headers from ArcGIS

---

*Architecture analysis: 2026-02-24*
