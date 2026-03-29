# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WORKable Intelligence Dashboard** — an enterprise organizational analytics platform (Layer 5 / Interaction System) built as a React SPA. The broader WORKable system is a 5-layer Human Capital Intelligence platform; this repo is only the frontend dashboard.

## Commands

All development work happens inside `main-dashboard/`:

```bash
cd main-dashboard

npm run dev       # Start Vite dev server (HMR enabled)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

Root-level `extract.js` is a one-off utility (`npm test` at root has no tests configured).

## Architecture

### App Structure

`App.tsx` is the shell — it renders top-level navigation and conditionally mounts one of four page sections based on active tab state:

| Tab | Section | Focus |
|-----|---------|-------|
| Command Center | Live diagnostics | HSI index, signal pulse, vulnerability radar, crisis proximity, strategic matrix |
| Deep Reveals | Value & risk | Benchmarking, process visualizations |
| Culture & Perception | "The Mirror" | Perception gaps, manager effectiveness, cultural insights |
| Industry Benchmarking | Competitive intelligence | Market norm comparisons |

### Component Model

`src/components/` contains ~25 specialized analytics components — each maps to a specific metric or visualization. Components are feature-heavy, self-contained, and animation-driven (Framer Motion). They do not currently fetch data from an API; data is statically defined within components.

Key components to be aware of:
- `CommandCenter` — orchestrates the main dashboard section
- `ActionCommandCentre` — action plans and nudging system
- `TheMirror` — perception vs. reality comparison view
- `ActionPlanPDF` — PDF report generation capability

### Design System

`src/index.css` defines the entire design token system via CSS variables:
- Dark theme exclusively (5 background levels: `--color-bg-*`)
- Text hierarchy: `--color-text-primary/secondary/tertiary/disabled`
- Semantic colors: `--color-accent`, `--color-success/warning/danger`
- Typography stack: **Syne** (display headings) / **DM Sans** (body) / **DM Mono** (mono)
- Tailwind CSS v4 is integrated — use `@tailwindcss/vite` plugin, not the CLI

### Tech Stack

- **React 19** + **TypeScript** (strict mode, `noUnusedLocals`, `noUnusedParameters`)
- **Vite 8** for builds
- **Tailwind CSS v4** for utility classes
- **Framer Motion 12** for all animations
- **Recharts 3** for charts/graphs
- **Lucide React** for icons
- **clsx** for conditional class composition

## Key Conventions

- TypeScript strict mode is enforced — all new code must satisfy it without `any` casts
- All styling uses Tailwind utilities + the CSS variable design tokens; avoid hardcoded colors
- Animations use Framer Motion `motion.*` components and `variants` patterns — match the existing motion style
- The platform uses ISO 30414:2023 aligned metric IDs (e.g., `HC-EFF-001`) — preserve these identifiers when referencing metrics

## Reference Documentation

`blueprint.txt` (root) is generated from the master architecture PDF (`Docs/WORKable_Blueprint_v5_COMPLETE.pdf`). It contains the authoritative specification for all 47+ signals, metric taxonomy, variable definitions, and the 5-layer system design. Consult it for domain context when working on analytics logic or metric naming.
