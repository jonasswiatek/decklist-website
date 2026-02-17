# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rules

- **Never run `git push`**. The user will push manually.

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
- **Manual API functions**: `model/api/apimodel.ts` — a few GET requests and `saveLibraryDeckRequest` (conditional endpoint routing)

### Query & Mutation Hooks (`Hooks/`)

Components never import `$api` directly. They import from `Hooks/`:

- **Query hooks** wrap `$api.useQuery()` with method+path baked in, plus options like `retry: false`, `refetchOnWindowFocus: false`, `staleTime: Infinity`
- **Mutation hooks** (`useEventMutations.ts`, `useDeckMutations.ts`, `useTournamentMutations.ts`, `useAuthMutations.ts`) wrap `$api.useMutation()` using a custom `MutationOptions<Method, Path>` utility type — see existing hooks for the pattern

### Auth

React Query manages auth state like all other server state:

- **`Hooks/useAuthQuery.ts`** — `useAuthQuery()` wraps `$api.useQuery("get", "/api/me")`. Returns `authorized`, `email`, `userId`, `sessionId`, `name` alongside standard query fields.
- **`Hooks/useAuthMutations.ts`** — `useStartLoginMutation()`, `useContinueLoginMutation()`, `useGoogleLoginMutation()`, `useLogoutMutation()` wrap `$api.useMutation()`.
- **Login flow**: `/login` route renders `LoginScreen`. After successful login, redirects to the `return` search param. Login/logout mutations call `queryClient.resetQueries()` on success to clear stale data and refetch.
- **Protected routes**: `ProtectedLayout` (in `Components/Login/LoggedIn.tsx`) is a layout route using `<Navigate>` and `<Outlet>`. All protected routes are grouped as children in the router config.

### Validation

`Util/Validators.ts` provides:
- `HandleValidation(setError, error)` — maps API ProblemDetails to react-hook-form field errors (used in mutation `onError`)
- `withValidation(setError, handler)` — wraps form submit handlers to catch and map validation errors (used in auth flows and library deck editor)

### WebSocket

`Hooks/useWebsocketConnection.ts` — generic `useDecklistWebSocketConnection<T>(channelName)` hook using `react-use-websocket`. Hardcoded to `wss://decklist.lol/ws` in production.
