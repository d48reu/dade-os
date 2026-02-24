# DADE/OS — Project Context

## What Is This
Retro terminal command-center AI workspace for Miami-Dade civic data.
Amber monochrome CRT aesthetic. Real GIS data rendered as wireframe geometry.

## Owner
Diego Abreu — PM for Miami-Dade County Commissioner, runs Abreu Data Works LLC.
Building civic tech tools for Miami government data.

## Aesthetic (NON-NEGOTIABLE)
- Monochrome amber (#FF6600) on pure black (#000000)
- NO blue, NO purple, NO gradients, NO white text
- Share Tech Mono font everywhere — ALL monospace
- CRT scanlines, phosphor glow, terminal panel chrome
- Reference: Super Terrain 86, Alien MU-TH-UR, IBM amber terminals
- Sharp corners only. No rounded anything.

## Tech Stack
Next.js 14+ (App Router), Tailwind, Three.js, Mapbox GL (minimap only)

## Key Data Source
Miami-Dade Building Footprint 2D via ArcGIS REST API
Endpoint: https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/BuildingFootprint2D_gdb/FeatureServer/0/query

## Active Sub-Projects
- miami21-translator (zoning code lookup)
- commission-search (county records search)

## Build Rules
- Keep dependencies minimal
- Test before committing
- Update this file when significant changes happen
