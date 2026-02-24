# Coding Conventions

**Analysis Date:** 2026-02-24

## Naming Patterns

**Files:**
- PascalCase for React components: `StatusBar.tsx`, `WeatherStrip.tsx`, `DataSelector.tsx`
- camelCase for utility/library files: `gis.ts`, `alerts.ts`, `weather.ts`, `theme.ts`
- Route files follow Next.js convention: `route.ts` in `app/api/` directories

**Functions:**
- camelCase for all function declarations: `fetchBuildingFootprints()`, `toSceneHeight()`, `transitQuery()`
- Descriptive verb-noun pattern: `fetchMetrorailLines()`, `fetchLargeBuildings()`, `setActiveOverlay()`
- React hooks use standard naming: `useState`, `useEffect`, `setTime()`

**Variables:**
- camelCase for all variables: `activeOverlay`, `maxRecords`, `DOWNTOWN_BBOX`
- UPPER_SNAKE_CASE for constants: `BUILDING_FOOTPRINT_URL`, `LARGE_BUILDING_URL`, `ARCGIS_BASE`, `FEET_TO_UNITS`
- Descriptive naming: `buildingFootprints`, `metrorailLines`, `transitStations`

**Types:**
- PascalCase with `Feature`/`Response` suffix: `BuildingFeature`, `GeoJSONResponse`, `TransitLineFeature`, `TransitStationFeature`, `TransitGeoJSON`
- Interface prefix pattern: all type definitions use `interface` keyword for contract definitions
- Generic typing: `TransitGeoJSON<T>` for reusable response types

## Code Style

**Formatting:**
- Tailwind CSS classes for styling (primary): `className="flex items-center justify-between px-4 py-1"`
- Inline style objects for dynamic/theme colors: `style={{ color: '#993D00' }}`
- Consistent line length with no visible line-wrapping issues
- Two-space indentation throughout

**Linting:**
- ESLint configured (version ^9) via `eslint.config.ts`
- ESLint config extends `eslint-config-next` (version 16.1.6)
- Lint command: `npm run lint` (runs `eslint`)
- Strict TypeScript checking enabled: `"strict": true` in `tsconfig.json`

## Import Organization

**Order:**
1. Next.js/React imports first: `import { useState } from 'react'`, `import dynamic from 'next/dynamic'`
2. Local component imports: `import TerminalPanel from './components/TerminalPanel'`
3. Utility/library imports: `import gis from './lib/gis'`

**Path Aliases:**
- Root alias configured: `"@/*": ["./*"]` in `tsconfig.json`
- Relative imports used throughout codebase (`./*`, `./components/`, `./lib/`)
- Relative paths are preferred over absolute aliases in current code

## Error Handling

**Patterns:**
- Throw-based error handling in async functions: `if (!res.ok) throw new Error('API error: ${res.status}')`
- Simple error messages with context: `throw new Error(\`GIS API error: ${res.status}\`)`
- Error messages include API endpoint context: "Metrorail lines API error", "Large building API error"
- No try-catch blocks observed; errors propagate to caller

## Logging

**Framework:** console (native browser/Node.js)

**Patterns:**
- No explicit logging observed in analyzed files
- Comments used for documentation instead of debug logging
- Console methods available for use but not currently standardized

## Comments

**When to Comment:**
- Used for section separation with ASCII dividers: `// ===== TRANSIT DATA =====`, `// ===== BUILDING HEIGHTS =====`
- Inline comments explain complex calculations: `// Fallback: estimate from footprint area`
- Comments describe intent over implementation

**JSDoc/TSDoc:**
- Not heavily used in current codebase
- Type annotations used instead for documentation: `BuildingFeature[]`, `Promise<GeoJSONResponse>`

## Function Design

**Size:**
- Utility functions kept small (10-20 lines): `transitQuery()`, `toSceneHeight()`
- Component functions kept under 100 lines: `StatusBar()`, `CommandCenter()`
- Larger functions broken into multiple helper functions

**Parameters:**
- Destructuring used for object parameters: `{ xmin, ymin, xmax, ymax }`
- Default parameters used: `bbox = DOWNTOWN_BBOX`, `maxRecords = 500`
- Single responsibility per function maintained

**Return Values:**
- Explicit typing: `Promise<GeoJSONResponse>`, `Promise<TransitGeoJSON<TransitLineFeature>>`
- Consistent return types across similar functions
- Early returns not observed; straightforward return statements

## Module Design

**Exports:**
- Named exports for functions: `export async function fetchBuildingFootprints()`, `export function toSceneHeight()`
- Named exports for interfaces: `export interface BuildingFeature`
- Default exports for React components: `export default function CommandCenter()`
- Constants exported as named exports: `export const DOWNTOWN_BBOX`

**Barrel Files:**
- Not observed in current codebase
- Direct imports from source files used instead: `import TerminalPanel from './components/TerminalPanel'`

## Client vs Server Components

**'use client' Directive:**
- Used in interactive components: `app/page.tsx`, `app/components/StatusBar.tsx`
- Enables React state management and hooks
- Placed at top of file before imports

**Server Functions:**
- Library files in `app/lib/` use server-side async/await
- GIS and API calls marked as async and server-compatible
- No explicit `'use server'` directive observed

---

*Convention analysis: 2026-02-24*
