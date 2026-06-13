# CrackNCET Web — Frontend Copilot Instructions

## Design System & Styling

- Use the shadcn preset and `app/globals.css` as the single source of truth for colors, typography, spacing, and radius.
- Never hardcode color values in components; always use CSS variables from `app/globals.css`.
- Prefer semantic tokens from the shadcn preset (e.g., `--background`, `--foreground`, `--primary`) over raw palette usage.
- Keep typography consistent with the system; change only when explicitly requested.
- When adding components, prefer shadcn primitives and extend them instead of creating new base styles.
- Follow a 12-column grid layout system for all responsive page structures.
- Use a mobile-first approach with breakpoints in this order: `<sm`, `sm+`, `md+`, `lg+`.

## Folder Structure & Ownership

- Shared, reusable UI components belong in `web/components`.
- Route-specific components must live under the route in `app/**/_components`.
- Treat folders prefixed with `_` as private to that route or feature.
- Extract utilities into `web/lib` or `web/utils` only when reused across routes.

## Component Architecture

- Build small, composable components with clear inputs and outputs.
- Co-locate small helper types and constants next to the component when they are not reused.
- Use consistent naming: `PascalCase` for components, `camelCase` for utilities and hooks.

## Comments & Documentation

- Keep comments minimal and purposeful.
- Use short, precise comments for non-obvious logic; avoid verbose narratives.

## Graphify Updates

- After any change in the `web` folder, update the graph by running `/graphify` in Copilot Chat.

## Quality & Production Practices

- Prefer type-safe props and explicit return types for public utilities.
- Avoid side effects in components; keep data-fetching at the route or server boundary.
- Maintain consistent spacing and layout with the design tokens.
- Keep files small and focused; refactor when a component becomes too complex.

## Step-by-Step Frontend Process (Must Follow)

### 1) Identify Route Scope

- If the UI is used across multiple routes → place component in `web/components`.
- If the UI is only for one route → place in `app/<route>/_components`.
- If the route needs private logic or state → create `app/<route>/_api`, `app/<route>/_queries`, `app/<route>/_store`.

### 2) API Layer (Server State)

- If any data comes from `/api/v1`, create or update `app/<route>/_api/*.api.ts`.
- The API layer only contains fetchers (no UI, no hooks, no Zustand).
- All endpoint URLs must be centralized here; do not call endpoints from components.

### 3) Query Layer (TanStack Query)

- If cached server state is needed, create `app/<route>/_queries/*.queries.ts`.
- Queries must call fetchers from `_api` only.
- Queries own cache keys, stale times, retries, and invalidation rules.
- Components never define query keys directly.

### 4) Client State (Zustand)

- If UI state is shared across multiple components on the route, create `app/<route>/_store/<name>.store.ts`.
- Stores handle filters, selections, modals, tabs, local drafts, and view preferences.
- Stores never call APIs directly; they can trigger invalidation via query helpers if needed.

### 5) Composition Layer

- `app/<route>/page.tsx` is the only file that composes queries + stores + components together.
- The page passes data and callbacks down; components stay pure and receive props only.

### 6) UI Components

- UI components live in `_components` or `web/components` based on reuse.
- Components must not fetch data or read query cache directly.
- Use shadcn primitives and tokens from `app/globals.css`.

### 7) Conditional Rules

- If no server data is needed → skip `_api` and `_queries`.
- If no shared UI state is needed → skip `_store` and use local state.
- If a component becomes reusable across routes → move it to `web/components` and update imports.

### 8) Data Connectivity Guardrails

- Only these files may connect data to UI: `_queries/*`, `_store/*`, and `page.tsx`.
- All other files remain presentation-only.

### 9) Consistency Checks

- Ensure route folders contain only what is used for that route.
- Keep naming consistent: `*.api.ts`, `*.queries.ts`, `*.store.ts`.
- Update `/graphify` after any `web` changes.

## Mobile-First 12-Grid UI Process

1. Start with a single-column layout (`<sm`) and validate content priority.
2. Map content blocks to the 12-column grid and define column spans.
3. Add `sm+` rules to introduce two-column groupings where needed.
4. Add `md+` rules to align sidebars, tables, and filters to the grid.
5. Add `lg+` rules for max-width, gutters, and dense dashboards.
6. Keep spacing and gutters aligned with design tokens; no ad-hoc spacing.
7. Verify each breakpoint for overflow, alignment, and legibility.

## Dynamic Metadata (SEO) Rules

- Any param route must define `generateMetadata` in `app/<route>/page.tsx` or `app/<route>/layout.tsx`.
- Metadata must use the same `_api` fetchers used by the route. Do not duplicate fetch logic.
- Avoid double fetches by wrapping fetchers with `cache()` or by using identical `fetch` options.
- Do not rely on client-side TanStack Query cache inside `generateMetadata`.
- Provide safe fallbacks when data is missing (title, description, og image).

## Error, Loading, and Empty States

- Every data-bound route must define `loading.tsx` and `error.tsx` when applicable.
- List views must handle loading, empty, and error states explicitly.
- Never surface raw server error messages directly to users.

## Mutations (TanStack Query)

- Define mutations in `app/<route>/_queries/*.queries.ts` alongside related queries.
- Always invalidate affected query keys on success.
- Use optimistic updates for latency-sensitive actions and provide rollback.
- Always define `onError` to roll back optimistic state and notify the user.

## Server vs Client Components

- Default to Server Components; add `"use client"` only when hooks or browser APIs are required.
- Server-only fetchers used by RSC or `generateMetadata` live in `_api/*.server.ts`.
- Client-safe fetchers used by TanStack Query live in `_api/*.api.ts`.
- Do not import client-only code into Server Components.

## Forms & Validation

- Use `react-hook-form` + Zod for all forms.
- Keep form schemas colocated with the form component or in `_validators` when shared.
- Never duplicate schema definitions between client and server.

## Accessibility (A11y)

- All interactive elements must be keyboard navigable.
- Use semantic HTML first; add `aria-*` only when semantics are insufficient.
- Ensure focus visibility and proper focus order in modals and drawers.

## Performance & Bundling

- Use `next/image` for images and prefer optimized sizes.
- Use `dynamic()` for heavy widgets or rarely used panels.
- Use `React.memo` or `useMemo` only when a measurable re-render cost exists.

## Auth & Protected Routes

- All protected routes must verify auth and role access at the route boundary.
- Use Next.js `middleware.ts` for auth redirects; use `layout.tsx` for role-based UI gating.
- UI must handle unauthenticated and unauthorized states with clear UX.

## Environment & Secrets

- Access `process.env` only in server modules.
- Client-side env vars must be prefixed with `NEXT_PUBLIC_` and contain no secrets.

## Suspense Guidance

- Use Suspense for isolated, heavy UI islands (charts, computed graphs, large tables).
- Prefer route-level `loading.tsx` for whole-page loading states.
- Wrap only the minimal subtree in `<Suspense>` to avoid blocking the entire page.
- Provide a lightweight fallback that matches layout to avoid layout shifts.
- When supported, prefer the `use()` pattern in Server Components for streaming data dependencies.

## Testing

- Unit test pure utilities in `lib/` and `utils/` with Vitest.
- Test query + component integration using MSW for API mocking.
- E2E test critical user flows with Playwright.
- Do not test implementation details; test behavior and outcomes.

## High-Load & Streaming (CDN, Video, CBT)

- Prefer CDN-hosted assets and signed URLs; avoid proxying large media through Next routes.
- Use streaming-friendly players and progressive loading for video content.
- Isolate heavy dashboards (live CBT, analytics, proctoring) with Suspense boundaries.
- Keep real-time UI updates minimal and throttle expensive renders.

## Student Dashboard Design (MANDATORY)

When working on any route under `app/dashboard/student/`, you MUST read and strictly adhere to:
`web/.github/student-dashboard-design.md`

This is the authoritative design specification. Key constraints:

- **Mobile-first ONLY**: Default Tailwind classes = phone viewport. Desktop is additive via `md:`, `lg:`.
- **Bottom tab bar on `<md`**: No sidebar, no hamburger. Sidebar appears at `md+` only.
- **44px minimum touch targets**: All buttons, links, list items, tabs, icons. No exceptions.
- **Forced landscape for media/tests**: Video, PDF, and CBT screens must call `screen.orientation.lock('landscape')` on fullscreen entry, with a "please rotate" fallback overlay.
- **Build order**: Complete mobile UI first. Add desktop breakpoints only AFTER mobile is reviewed and functional.
- **Immersive mode**: Video, PDF, and CBT screens hide the bottom tab bar and top header. Use `isImmersive` flag from `StudentLayoutContext`.
