# External Integrations

**Analysis Date:** 2026-02-24

## APIs & External Services

**GIS and Mapping:**
- ArcGIS REST API (Esri)
  - Purpose: Fetch building footprints, large building data, and transit infrastructure
  - Base URL: `https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services`
  - Endpoints:
    - `BuildingFootprint2D_gdb/FeatureServer/0/query` - Building polygons and heights
    - `LargeBuilding_gdb/FeatureServer/0/query` - Large structures with height data
    - `MetroRail_gdb/FeatureServer/0/query` - Metrorail line geometry
    - `MetroRailStations_gdb/FeatureServer/0/query` - Station locations
    - `MetroMover_gdb/FeatureServer/0/query` - Metromover line geometry
    - `MetroMoverStations_gdb/FeatureServer/0/query` - Metromover station locations
  - Response format: GeoJSON
  - Location: `app/lib/gis.ts`
  - Authentication: None (public service)

**Weather Data:**
- Open-Meteo Weather API
  - Purpose: Current weather conditions for Miami (latitude 25.7617, longitude -80.1918)
  - Base URL: `https://api.open-meteo.com/v1/forecast`
  - Query params: temperature, wind speed, wind direction, humidity, weather code, pressure
  - Temperature unit: Fahrenheit
  - Wind speed unit: mph
  - Timezone: America/New_York
  - Response format: JSON
  - Location: `app/lib/weather.ts`
  - Authentication: None (public API)

**Weather Alerts:**
- NOAA Weather Alerts API
  - Purpose: Active weather alerts for Miami-Dade County zones
  - URL: `https://api.weather.gov/alerts/active?zone=FLZ073,FLZ074,FLZ173`
  - Zones covered: FLZ073 (Coastal Miami-Dade), FLZ074 (Inland Miami-Dade), FLZ173 (Coastal Monroe)
  - Response format: GeoJSON with alert features
  - User-Agent header required: "DADE-OS/0.1 (civic-data-dashboard)"
  - Location: `app/lib/alerts.ts`
  - Authentication: None (public API)

**Fire Rescue Data:**
- Miami-Dade Fire Rescue (MDFR) CAD System
  - Purpose: Real-time active fire/rescue calls in Miami-Dade County
  - URL: `https://www.miamidade.gov/firecad/calls_include.asp`
  - Method: HTML scraping (server-side via Next.js API route)
  - Response format: HTML table parsed to JSON
  - User-Agent header required: "DADE-OS/0.1 (civic-data-dashboard)"
  - Location: `app/api/fire-calls/route.ts`
  - Caching: 30-second TTL to avoid overwhelming source
  - Fallback: Returns cached data on failure
  - Authentication: None (public data)

## Data Storage

**Databases:**
- Not detected - No database integration in use

**File Storage:**
- Local filesystem only - Static assets via `public/` directory

**Caching:**
- In-memory cache (server-side) for fire rescue calls
  - Cache duration: 30 seconds
  - Implementation: `app/api/fire-calls/route.ts`

## Authentication & Identity

**Auth Provider:**
- None - Application is public with no user authentication required

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Console-based error handling in API routes
- Error states in fetch operations with fallback behavior

## CI/CD & Deployment

**Hosting:**
- Vercel - Production deployment platform (`.vercel` directory indicates configuration)

**CI Pipeline:**
- Not detected - Default Next.js/Vercel CI likely in use

## Environment Configuration

**Required env vars:**
- None explicitly required - All external APIs are public and don't require secrets

**Secrets location:**
- No secrets detected in codebase
- All API endpoints are public/unauthenticated

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected - Data flows are read-only (fetch operations)

## Data Flow Summary

**Primary data sources:**
1. ArcGIS (building geometry and transit infrastructure) → 3D visualization
2. Open-Meteo (current weather) → Weather display widget
3. NOAA (active alerts) → Alert feed
4. MDFR CAD (active calls) → Fire/rescue incident tracking

All integrations are read-only, public APIs with no authentication requirements. Data is fetched on-demand and optionally cached server-side.

---

*Integration audit: 2026-02-24*
