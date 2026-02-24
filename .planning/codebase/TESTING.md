# Testing Patterns

**Analysis Date:** 2026-02-24

## Test Framework

**Runner:**
- Not detected - No test framework configured
- `package.json` contains no test dependencies (Jest, Vitest, Mocha, Cypress, etc.)

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
npm run lint              # Run ESLint
npm run dev              # Development server (no test execution)
npm run build            # Production build
npm start                # Production start
```

## Test File Organization

**Location:**
- Not applicable - No test files found in source directory
- Test files from node_modules dependencies exist but are not part of project tests

**Naming:**
- Not applicable - No test files in application code

**Structure:**
- No test structure observed

## Test Structure

**Suite Organization:**
- Not applicable - Testing framework not configured

**Patterns:**
- No unit test patterns established
- No test setup/teardown patterns found

## Mocking

**Framework:**
- Not configured

**Patterns:**
- No mocking libraries installed (Jest, Sinon, Mock Service Worker, etc.)

**What to Mock:**
- External API calls (GIS services in `app/lib/gis.ts`)
- Fetch requests for ArcGIS Feature Servers
- Dynamic imports (Three.js WireframeCityscape component)

**What NOT to Mock:**
- React hooks and component rendering
- DOM/browser APIs
- Internal utility functions

## Fixtures and Factories

**Test Data:**
- Not established - No test infrastructure in place
- Static data could be extracted from: constants in `app/lib/gis.ts` like `DOWNTOWN_BBOX`, API response types like `BuildingFeature`, `TransitStationFeature`

**Location:**
- Would be placed in `__tests__/fixtures/` directory (convention not yet implemented)

## Coverage

**Requirements:**
- Not enforced - No coverage configuration found

**View Coverage:**
- Not applicable - No test runner configured

## Test Types

**Unit Tests:**
- Not implemented
- Candidates for unit testing: utility functions in `app/lib/` (gis.ts, alerts.ts, weather.ts, theme.ts)
- Example: `toSceneHeight()`, `transitQuery()` functions

**Integration Tests:**
- Not implemented
- Candidates: API integration tests for ArcGIS Feature Server calls in `app/lib/gis.ts`
- Example: `fetchBuildingFootprints()`, `fetchMetrorailStations()` with real/stubbed API responses

**E2E Tests:**
- Not implemented
- No E2E framework configured (Cypress, Playwright, Puppeteer)

## Recommended Testing Setup

**Framework to Add:**
- Vitest (lightweight, modern, ESM native) or Jest (more established)
- Configuration file: `vitest.config.ts` at project root

**Testing Approach:**
- Unit tests for utility functions in `app/lib/`
- Integration tests for API calls using mock fetch
- Component tests for React components (consider adding @testing-library/react)

**Priority Test Coverage:**
1. GIS API functions: `fetchBuildingFootprints()`, `fetchMetrorailLines()`, `fetchLargeBuildings()`
2. Utility functions: `toSceneHeight()`, `transitQuery()`
3. Component rendering and state management in interactive components
4. Error handling in API fetch calls

---

*Testing analysis: 2026-02-24*
