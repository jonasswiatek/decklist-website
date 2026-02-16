# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

All commands run from `src/`:

```bash
cd src
npm run dev          # Vite dev server with HMR (proxies /api to localhost:5290)
npm run build        # tsc -b && vite build (CI runs this — must pass)
npm run lint         # ESLint, zero warnings tolerance
npm run generate-api-client  # Regenerate OpenAPI types from backend schema
```

Sass deprecation warnings from Bootstrap during build are expected and ignorable.

There is no test framework configured. Do not attempt to run tests.

## Architecture

React 19 + TypeScript app. Vite build. Bootstrap 5 dark theme. Source lives in `src/src/`.

### API Layer (OpenAPI-first)

- **Client**: `model/api/client.ts` — singleton `fetchClient` (openapi-fetch) and `$api` (openapi-react-query)
- **Generated types**: `model/api/decklist-api-schema.d.ts` — regenerate with `npm run generate-api-client` after backend changes
- **Manual API functions**: `model/api/apimodel.ts` — auth flows, a few GET requests, and `saveLibraryDeckRequest` (conditional endpoint routing). These exist because they're called from Zustand (outside React) or have special logic

### Query & Mutation Hooks (`Hooks/`)

Components never import `$api` directly. They import from `Hooks/`:

- **Query hooks** wrap `$api.useQuery()` with method+path baked in, plus options like `retry: false`, `refetchOnWindowFocus: false`, `staleTime: Infinity`
- **Mutation hooks** (`useEventMutations.ts`, `useDeckMutations.ts`, `useTournamentMutations.ts`) wrap `$api.useMutation()` using a custom `MutationOptions<Method, Path>` utility type — see existing hooks for the pattern

### Auth

Zustand store (`store/deckliststore.ts`) manages auth state. Cannot use React Query hooks for auth because it runs outside React component lifecycle. Auth context provided via `Components/Login/AuthContext.tsx`, consumed via `useAuth()` hook. Protected routes use `<LoggedIn>` wrapper.

### Validation

`Util/Validators.ts` provides:
- `HandleValidation(setError, error)` — maps API ProblemDetails to react-hook-form field errors (used in mutation `onError`)
- `withValidation(setError, handler)` — wraps form submit handlers to catch and map validation errors (used in auth flows and library deck editor)

### WebSocket

`Hooks/useWebsocketConnection.ts` — generic `useDecklistWebSocketConnection<T>(channelName)` hook using `react-use-websocket`. Hardcoded to `wss://decklist.lol/ws` in production.
