# Technology Stack

**Analysis Date:** 2026-02-24

## Languages

**Primary:**
- TypeScript 5.x - Application code, configuration files
- JavaScript/JSX - React components (with TS-based variants)

**Secondary:**
- HTML/CSS - Template and styling
- Bash - Build scripts

## Runtime

**Environment:**
- Node.js - Server runtime for Next.js

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - React-based full-stack framework for SSR, API routes, and static generation
- React 19.2.3 - UI component library
- React-DOM 19.2.3 - DOM rendering for React

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework via `@tailwindcss/postcss`
- PostCSS 8.x - CSS transformation

**3D Graphics:**
- Three.js 0.183.1 - WebGL-based 3D graphics library
- @types/three 0.183.1 - TypeScript type definitions for Three.js

## Key Dependencies

**Critical:**
- three - 3D building visualization and cityscape rendering engine
- react - Component-driven UI framework for Miami dashboard
- next - Full-stack framework enabling SSR, API routes, and optimized builds

**Build & Development:**
- TypeScript - Static type checking and transpilation
- ESLint 9.x - Code linting and quality assurance
- eslint-config-next - ESLint configuration for Next.js best practices
- Tailwind CSS - Responsive utility-based styling

## Configuration

**Environment:**
- Configuration through `next.config.ts` - Minimal/default config present
- TypeScript paths alias: `@/*` maps to root directory in `tsconfig.json`

**Build:**
- `next.config.ts` - Next.js build configuration
- `tsconfig.json` - TypeScript compiler options (strict mode enabled, JSX as react-jsx)
- `postcss.config.mjs` - PostCSS plugin configuration for Tailwind

**Linting:**
- `.eslintrc.mjs` (inferred from `eslint.config.mjs` in node_modules) or similar - ESLint configuration

## Platform Requirements

**Development:**
- Node.js 18+ (inferred from @types/node ^20)
- npm (package manager)
- Modern browser with WebGL support (for Three.js 3D rendering)

**Production:**
- Deployment target: Vercel (`.vercel` directory present)
- Server runtime: Node.js
- Browser: Modern browsers with ES2017 support (TypeScript target: ES2017)

## Scripts

**Available Commands:**
```bash
npm run dev      # Start development server
npm run build    # Build production bundle
npm start        # Start production server
npm run lint     # Run ESLint
```

---

*Stack analysis: 2026-02-24*
