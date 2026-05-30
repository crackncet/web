# CrackNCET Web — Frontend Copilot Instructions

## Design System & Styling

- Use the shadcn preset and `app/globals.css` as the single source of truth for colors, typography, spacing, and radius.
- Never hardcode color values in components; always use CSS variables from `app/globals.css`.
- Prefer semantic tokens from the shadcn preset (e.g., `--background`, `--foreground`, `--primary`) over raw palette usage.
- Keep typography consistent with the system; change only when explicitly requested.
- When adding components, prefer shadcn primitives and extend them instead of creating new base styles.

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
