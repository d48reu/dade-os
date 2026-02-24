# Codebase Concerns

**Analysis Date:** 2026-02-24

## Tech Debt

**Monolithic WireframeCityscape Component:**
- Issue: `app/components/WireframeCityscape.tsx` is 555 lines with mixed responsibilities—3D scene setup, building data fetching, transit overlay management, error handling, and rendering logic all in one file.
- Files: `app/components/WireframeCityscape.tsx`
- Impact: Makes testing difficult, refactoring risky, and reusing scene logic impossible. New features (e.g., adding building selection, modifying transit rendering) require changing a massive component.
- Fix approach: Extract Three.js scene initialization into a custom hook (`useThreeScene`), move building/transit fetching to separate data-fetching hooks, and separate rendering concerns into smaller subcomponents.

**HTML Parser for Fire CAD Data:**
- Issue: `app/api/fire-calls/route.ts` parses HTML using regex (`/<td[^>]*>([\s\S]*?)<\/td>/gi`) instead of a proper HTML parser.
- Files: `app/api/fire-calls/route.ts` (lines 46-103)
- Impact: Parser is fragile—any change to MDFR website structure (tag attributes, spacing, nesting) will break silently. Currently returns empty or malformed data without alerting.
- Fix approach: Replace regex parsing with `cheerio` or similar HTML parsing library. Add unit tests with multiple HTML structure variations. Implement structured logging/alerting on parse failures.

**No Input Validation on API Responses:**
- Issue: `fetchBuildingFootprints()`, `fetchLargeBuildings()`, `fetchMetrorailLines()`, etc. in `app/lib/gis.ts` assume API responses conform to expected GeoJSON schema without validation.
- Files: `app/lib/gis.ts` (lines 34-147)
- Impact: Malformed API responses will crash the 3D renderer. No graceful degradation or user feedback about data quality.
- Fix approach: Add Zod or similar schema validation to all GIS fetch functions. Return typed results with metadata about data quality/completeness.

**Manual Cache Implementation:**
- Issue: `app/api/fire-calls/route.ts` uses a module-level mutable cache object (`let cache: { data: FireCall[]; ts: number }`).
- Files: `app/api/fire-calls/route.ts` (lines 15-16)
- Impact: Cache is not cleared on deploy, not shared across server instances (if scaled to multiple replicas), and has no TTL enforcement for stale data edge cases. Race conditions possible if multiple requests hit during cache refresh.
- Fix approach: Use proper caching layer (Redis, or Next.js ISR) or implement request deduplication with Promise memoization.

**Missing Error Boundaries:**
- Issue: Components like `WireframeCityscape` and `WeatherStrip` catch errors and log to console, but provide no user-visible error states for recovery.
- Files: `app/components/WireframeCityscape.tsx` (line 367), `app/components/WeatherStrip.tsx` (line 23), `app/components/AlertFeed.tsx` (lines 65, 82)
- Impact: When external APIs fail (ArcGIS, Open-Meteo, NOAA, MDFR), users see frozen/blank panels with no indication of what went wrong. Makes debugging user issues difficult.
- Fix approach: Implement React Error Boundary. Add explicit error states with retry buttons. Surface API status to users.

**Heavy Canvas Rendering in WeatherStrip:**
- Issue: `app/components/WeatherStrip.tsx` redraws entire canvas every 100ms (line 270) regardless of whether data changed.
- Files: `app/components/WeatherStrip.tsx` (line 270)
- Impact: Unnecessary CPU usage, battery drain on mobile, may cause jank if combined with other animations.
- Fix approach: Implement conditional drawing (only redraw on weather data change or canvas resize, not on tick increment).

**Hardcoded Geographic Bounds:**
- Issue: `DOWNTOWN_BBOX` and `CENTER` coordinates are hardcoded in multiple files.
- Files: `app/lib/gis.ts` (lines 27-32), `app/components/WireframeCityscape.tsx` (lines 20-21)
- Impact: Changing geographic focus requires updating multiple files. No way to make the dashboard work for other cities/regions without code changes.
- Fix approach: Move geographic config to environment variables or a centralized config file. Accept bbox as component prop or context.

## Security Considerations

**Unvalidated External Data Rendering:**
- Risk: 3D scene renders building geometry from ArcGIS API without bounds checking. Malicious data (extremely large coordinates, invalid geometry) could crash the WebGL context or cause DOS.
- Files: `app/components/WireframeCityscape.tsx` (lines 43-70), `app/lib/gis.ts`
- Current mitigation: None—code assumes data is well-formed.
- Recommendations: Validate and clamp coordinate ranges. Set limits on feature counts (reject responses with >5000 buildings). Implement request timeouts and abort signals.

**Open External API Endpoints:**
- Risk: `/api/fire-calls` publicly exposes MDFR data by forwarding requests to `miamidade.gov/firecad/calls_include.asp`. No rate limiting or authentication.
- Files: `app/api/fire-calls/route.ts`
- Current mitigation: None.
- Recommendations: Add rate limiting (using middleware or API key). Consider if this endpoint should be public or authenticated.

**No CORS Headers or Content-Type Validation:**
- Risk: Next.js API routes don't explicitly set CORS headers. Open-Meteo and ArcGIS are called from client-side components, relying on their CORS policies.
- Files: `app/components/WireframeCityscape.tsx` (lines 278-303), `app/components/WeatherStrip.tsx` (line 17)
- Current mitigation: Third-party CORS policies (external to your control).
- Recommendations: Route external API calls through Next.js `/api/` layer if sensitive. Add explicit CORS headers and Content-Type validation.

## Performance Bottlenecks

**Initial Building Load is Blocking:**
- Problem: `loadBuildings()` fetches and processes 500+ buildings in a single `Promise.allSettled()` call, blocking camera setup and rendering.
- Files: `app/components/WireframeCityscape.tsx` (lines 278-371)
- Cause: No pagination, streaming, or progressive rendering. All geometry computed synchronously.
- Improvement path: Implement chunked loading (fetch 100 buildings, render, then fetch next batch). Use Web Worker for geometry computation. Show partial scene while loading.

**Three.js Material Reallocation:**
- Problem: `WireframeCityscape` creates new material objects for every feature render pass instead of reusing materials.
- Files: `app/components/WireframeCityscape.tsx` (lines 284-294)
- Cause: Materials are created in `loadBuildings()` but could be cached at scene init.
- Improvement path: Move material creation to `initScene()`. Reuse materials across all features.

**Canvas Resize and Redraw on Every Frame:**
- Problem: `WeatherStrip` resizes canvas and scales context every 100ms.
- Files: `app/components/WeatherStrip.tsx` (lines 42-44)
- Cause: Canvas is resized on every draw tick, not just on window resize.
- Improvement path: Move canvas setup to `useEffect` with ResizeObserver. Only redraw on actual changes.

**Alert Feed Auto-Scroll with Tight Interval:**
- Problem: `AlertFeed` scrolls every 80ms using `setInterval`.
- Files: `app/components/AlertFeed.tsx` (line 116)
- Cause: Arbitrary interval; no cleanup on unmount documented. Multiple mounts = multiple intervals.
- Improvement path: Use `requestAnimationFrame` for smooth scrolling. Ensure cleanup is always called (currently looks safe but fragile).

## Fragile Areas

**GIS API Dependency Chain:**
- Files: `app/lib/gis.ts`, `app/components/WireframeCityscape.tsx`
- Why fragile: Component relies on ArcGIS being available and returning specific GeoJSON structure. If API is down, rate-limited, or schema changes, entire 3D view fails silently (falls back to random sample buildings). Makes it appear the app works when it doesn't.
- Safe modification: Implement comprehensive API health checks. Return explicit error states (not fallbacks). Add monitoring/alerting for API changes.
- Test coverage: No unit tests for GIS module. No integration tests for API responses.

**HTML Parsing in Fire CAD Endpoint:**
- Files: `app/api/fire-calls/route.ts`
- Why fragile: Regex-based parsing assumes exact HTML structure. MDFR can change markup without warning. Parse failures silently return empty array.
- Safe modification: Use HTML parser library. Add tests with real MDFR HTML samples (or fixtures). Monitor parse failures.
- Test coverage: No tests. No fixtures. No way to verify parsing works with actual MDFR HTML.

**Canvas Rendering State in WeatherStrip:**
- Files: `app/components/WeatherStrip.tsx`
- Why fragile: `tick` variable and canvas context state are tightly coupled. Multiple useEffect hooks manage draw loop and interval cleanup. If one cleanup fails, intervals leak.
- Safe modification: Extract canvas rendering to custom hook. Use ref-based state instead of mutable `tick` variable. Add tests for cleanup on unmount.
- Test coverage: No tests. Verify cleanup actually runs on component unmount.

**Three.js Scene Lifecycle:**
- Files: `app/components/WireframeCityscape.tsx` (lines 204-276)
- Why fragile: Scene stores animation frame ID in ref. Cleanup function removes event listener but `sceneRef.current` could be null if cleanup runs twice. WebGL resources may leak if renderer disposal fails.
- Safe modification: Add null checks in cleanup. Test unmount/remount cycles. Consider using Suspense boundaries.
- Test coverage: No tests for scene initialization/cleanup.

## Scaling Limits

**Arbitrary Feature Count Limits:**
- Current capacity: Fetches max 500 buildings per API call (hardcoded in `gis.ts` line 36: `maxRecords = 500`).
- Limit: Three.js wireframe rendering bogs down with >500 buildings on average hardware. No LOD (level-of-detail) implemented.
- Scaling path: Implement spatial partitioning (quadtree). Render distant buildings as simplified geometry. Use instancing for repeated shapes. Implement frustum culling.

**Single-Scene Architecture:**
- Current capacity: One scene, one camera, one renderer per component instance.
- Limit: Cannot render multiple views/perspectives. Difficult to add split-screen or minimap properly.
- Scaling path: Extract scene to context/provider. Support multiple viewports with shared geometry buffer.

**Alert Feed Memory:**
- Current capacity: Loads all active alerts into state array every 60 seconds (no limit).
- Limit: If 1000+ simultaneous alerts exist, component will struggle. No pagination or virtualization.
- Scaling path: Virtualize alert list (render only visible items). Implement alert archival/cleanup. Add pagination.

## Dependencies at Risk

**No Testing Dependencies:**
- Risk: Zero test infrastructure (no Jest, Vitest, Playwright). No way to verify features work as bugs accumulate.
- Impact: Breaking changes go undetected. Refactoring is risky. API changes force manual testing.
- Migration plan: Add Jest for unit tests. Add Playwright/Cypress for E2E. Establish test coverage baseline (50%+ target).

**Direct Three.js Version Dependency:**
- Risk: `three@^0.183.1` uses caret range. Minor version updates could introduce breaking changes to scene rendering.
- Impact: Upgrades may silently break wireframe rendering or material handling.
- Migration plan: Pin to exact version or use tilde (`~0.183.1`). Test each Three.js upgrade thoroughly. Add regression tests for 3D rendering.

**External API Availability Assumptions:**
- Risk: ArcGIS, Open-Meteo, NOAA, MDFR are all external dependencies with no SLAs. Any can be rate-limited, deprecated, or changed.
- Impact: Features silently degrade (fallback to sample data, "ACQUIRING..." states). Users don't know if system is working.
- Migration plan: Cache API responses aggressively. Implement health checks. Add admin dashboard showing API status. Use fallback data that's more explicit about being fallback.

## Test Coverage Gaps

**No GIS Module Tests:**
- What's not tested: Building fetch logic, height calculation fallback, coordinate transformation, transit feature parsing.
- Files: `app/lib/gis.ts`
- Risk: Changes to `toSceneHeight()` or `geoToVec3()` could silently break 3D layout.
- Priority: High

**No Fire CAD Parser Tests:**
- What's not tested: HTML parsing, cell extraction, district detection, edge cases (missing cells, malformed HTML).
- Files: `app/api/fire-calls/route.ts` (parseFireCAD function)
- Risk: Parser breaks silently when MDFR changes HTML. No way to verify correctness with real data.
- Priority: High

**No Component Integration Tests:**
- What's not tested: WireframeCityscape initialization, scene cleanup, overlay toggle, error states, API failure handling.
- Files: `app/components/WireframeCityscape.tsx`, `app/components/WeatherStrip.tsx`, `app/components/AlertFeed.tsx`
- Risk: Component lifecycle issues (memory leaks, unmount bugs) go undetected.
- Priority: High

**No E2E Tests:**
- What's not tested: Full user flows (load page → see 3D scene → toggle overlay → see weather), API integration, error recovery.
- Files: All
- Risk: Regressions in critical user journeys discovered in production.
- Priority: Medium

**No Performance Tests:**
- What's not tested: Canvas rendering FPS, memory usage with large feature counts, WebGL resource cleanup, animation frame leaks.
- Files: `app/components/WireframeCityscape.tsx`, `app/components/WeatherStrip.tsx`
- Risk: Performance regressions accumulate silently. Battery drain, jank go unnoticed.
- Priority: Medium

---

*Concerns audit: 2026-02-24*
