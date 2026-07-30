# Redesign: Bootstrap → Tailwind v4 + shadcn/ui

This branch (`redesign/tailwind-shadcn`) migrates the whole site off **Bootstrap /
react-bootstrap** onto **Tailwind v4 + shadcn/ui**. Dark-first, neutral **zinc/slate**
background with a single **emerald** accent. Mobile-first — mobile is the most common device.

Status: **complete and green** — `npm run build`, `npm run lint` (max-warnings 0), and
`tsc -b` all pass. Bootstrap and its friends are fully uninstalled. Nothing is pushed.

---

## How to run

All commands run from `src/`:

```bash
cd src
npm install          # restore deps (Tailwind, shadcn radix primitives, lucide, sonner)
npm run dev          # Vite dev server, proxies /api → https://decklist.lol
npm run build        # tsc -b && vite build (CI must pass)
npm run lint         # eslint, zero warnings tolerated
```

No test framework is configured (unchanged).

---

## What changed at the foundation

- **Vite**: added `@tailwindcss/vite`. Replaced the old `~bootstrap` alias with `@` → `src/src`
  (`vite.config.ts`). Path alias also added to `tsconfig.json` / `tsconfig.app.json`
  (`"@/*": ["./src/*"]`).
- **Global CSS**: `src/src/index.scss` + `App.scss` were **deleted** and replaced by a single
  **`src/src/index.css`**. It contains:
  - `@import "tailwindcss";` + `@import "tw-animate-css";`
  - The design tokens (shadcn CSS variables in OKLCH) — dark palette, emerald `--primary`.
  - Ported custom styles that were hard to express as utilities: `.decklist-columns`
    (2-col → 1-col under 800px), `.timer-display-font` / `.timer-display-font-table` /
    `.clock-name-font` / `.clock-container-query` (container-query scaled timer fonts),
    `.shake-warning-border` (periodic warning shake), the `@media print` block
    (`.print-decklist-columns`, `.print-decklist-group`, `.no-print`), and `.ms-cost`.
- **Dark theme**: `index.html` now has `<html class="dark" style="color-scheme: dark;">`
  (was `data-bs-theme="dark"`). The mana-font CDN + Google Fonts (Inter, M PLUS Code Latin)
  links are unchanged.
- **Toasts**: migrated from react-bootstrap Toast to **sonner**. The public API is unchanged —
  components still call `const { showToast } = useToast()` from `@/Util/ToastContext`
  (`showToast(message, 'success' | 'danger' | 'warning')`). `ToastProvider` now just renders
  the sonner `<Toaster/>`.
- **Icons**: all icons are **lucide-react** now. `react-icons` and `react-bootstrap-icons`
  are removed.
- **Removed deps**: `bootstrap`, `react-bootstrap`, `react-bootstrap-icons`, `react-icons`,
  `@types/bootstrap`, `@popperjs/core`, `sass`.

## Component library (shadcn/ui primitives)

Primitives live in **`src/src/Components/ui/`** — import as `@/Components/ui/<name>`.

> ⚠️ **Capital `C` in `Components` matters.** The repo folder is `Components` (case-sensitive
> on CI/Linux). On Windows the FS is case-insensitive, so writing to `components/ui` silently
> lands in `Components/ui` and then TypeScript errors on the casing mismatch. Always write and
> import with capital `Components`.

Available: `button`, `card`, `input`, `textarea`, `label`, `badge`, `alert`, `table`,
`separator`, `spinner`, `dropdown-menu`, `dialog`, `sheet` (mobile nav), `select`,
`sonner` (Toaster). Plus a layout helper **`@/Components/layout/PageContainer`** and the
`cn()` util in **`@/lib/utils`**. `components.json` is configured (baseColor zinc, `@/Components`
aliases) so `npx shadcn@latest add <name>` works — but double-check any generated file uses the
capital `Components` path.

### Adding more shadcn components

`npx shadcn@latest add <name>` from `src/`. If the CLI writes to lowercase `components/`, move
the file into `Components/ui/` and fix the import path casing.

## Layout & width conventions

`PageContainer` centers content with a responsive max-width. Sizes:
- `sm` → `max-w-xl` (~576px): login, create forms.
- `default` → `max-w-4xl` (~896px): prose/help pages, login.
- `lg` → `max-w-7xl` (~1280px): data-heavy app pages (event/judge/deck, library, timers, landing).
- `full` → `max-w-none`.

The navbar/footer in `App.tsx` are capped at `max-w-7xl` to align with `lg` pages. If you widen
`lg` again, widen the navbar/footer to match.

## Architecture note (App shell)

`App.tsx` was restructured: the navbar/footer now live **inside** the router as a `RootLayout`
route (using `<NavLink>` / `useLocation`), instead of the old pattern where they sat outside
`RouterProvider` and navigated via `window.location` + manual `pushState`. Chromeless routes
(`/e/:id/qr`, `/e/:id/deck/print`, `/timers/:id/view`) hide the nav/footer via `useChromeless()`.

## ESLint

`eslint.config.js` has an override turning off `react-refresh/only-export-components` for
`src/Components/ui/**` — shadcn primitives co-locate `cva` variant helpers with components,
which that rule flags. Everything else is unchanged (still `--max-warnings 0`).

## Gotchas / things to know

- **Native `<select>` dropdowns** (DeckView import, LibraryDeckEditor format, CreateEvent
  format) need explicit dark option colors or the option list renders white-on-white. They use
  a shared `selectClasses` string that includes
  `[&_option]:bg-popover [&_option]:text-popover-foreground [&_optgroup]:bg-popover ...`.
  Keep that if you touch them. (LibraryOverview's filter uses the Radix `Select` primitive and
  doesn't have this issue.)
- **No application logic changed.** Hooks, TanStack Query, react-hook-form, mutations,
  websockets, timer math, routing, and exported component names are all as before. This was a
  markup/visual migration.
- **Chunk size warning** on build (~707 kB JS) is pre-existing (whole-app bundle), not from this
  work. Code-splitting could be a future task.

## Dependency security (npm audit)

Ran `npm audit fix` (non-breaking) and removed the unused `http-proxy-middleware`
direct dependency. That patched everything reachable at runtime:
vite 8.0.8→8.1.5, react-router(-dom) 7.14.1→7.18.2, postcss, @babel/*, js-yaml,
immutable, brace-expansion (installed versions now patched), etc.

Two items remain, both **not fixed on purpose** because the only fixes are breaking and
neither affects the shipped app:
- **react-router "RSC Mode CSRF Bypass"** — RSC/SSR-only advisory. This is a client SPA
  (`createBrowserRouter`, no SSR/RSC), so it does not apply. npm's `--force` "fix" is a
  *downgrade* to 7.11.0 (loses the patches above) — don't take it.
- **brace-expansion / minimatch DoS** via `eslint` and `@redocly/openapi-core`
  (`openapi-typescript`) — **dev/build tooling only**, never shipped. The installed
  brace-expansion versions are already patched; npm flags minimatch's declared range.
  Clearing it requires **eslint 10** (breaking major — verify the plugins support it first).

Do **not** run `npm audit fix --force` — it downgrades react-router and force-bumps eslint.
Revisit the eslint 10 upgrade as its own task if a clean `npm audit` is desired.

## Possible follow-ups (not done)

- Visual QA pass on a real device (mobile especially) — browser automation wasn't available.
- Consider route-based code-splitting to quiet the bundle-size warning.
- Optionally widen `lg` further (~1400px) or go near-full-width for the data pages if 1280px
  still feels boxed-in on large monitors.
- A few pages still use lightly-styled native `<table>`/`<select>` where a shadcn primitive
  could be swapped in for consistency.
