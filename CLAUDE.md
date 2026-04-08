# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

TypeScript SDK for the VynCo API (`api.vynco.ch`) — Swiss company data, analytics, AI intelligence, credit management, and platform administration. This is the TypeScript counterpart to the Rust SDK at `../VynCorp-rust/vc-rust`.

## Commands

```bash
pnpm build          # Build ESM + CJS + .d.ts via tsup
pnpm test           # Run all tests (vitest)
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Type-check with tsc --noEmit

# Run a single test file
npx vitest run tests/client.test.ts

# Run tests matching a pattern
npx vitest run -t "maps 401"
```

If `pnpm` is not installed globally, prefix with `npx`: `npx pnpm build`.

## Architecture

**Single entry point**: Everything is exported from `src/index.ts`. The public API surface is `VyncoClient` plus typed resources, errors, and data model interfaces.

**Base URL**: Default is `https://vynco.ch/api`. The health endpoint is at `/health` (no `/v1` prefix). All other endpoints use `/v1/` prefix (e.g., `/v1/companies`, `/v1/credits/balance`).

**Client → Resources pattern**: `VyncoClient` (in `src/client.ts`) owns the HTTP transport layer and exposes internal `_request*` methods (underscore-prefixed, not truly private — used by resource classes). Each resource class (e.g., `Companies`, `Credits`) takes a `VyncoClient` reference and calls these internal methods. Resources are instantiated in the `VyncoClient` constructor and exposed as readonly properties (`client.companies`, `client.credits`, etc.).

**18 resource modules** (80+ endpoints): health, companies, auditors, dashboard, screening, watchlists, webhooks, exports, ai, apiKeys, credits, billing, teams, changes, persons, analytics, dossiers, graph.

**Key internal methods on VyncoClient**:
- `_request<T>(method, path)` — GET with no body, returns `VyncoResponse<T>`
- `_requestWithBody<T>(method, path, body)` — POST/PUT with JSON body
- `_requestWithParams<T>(method, path, params)` — GET with query string
- `_requestEmpty(method, path)` — DELETE, returns `ResponseMeta` only
- `_requestBytes(method, path)` — GET returning raw bytes for file downloads (exports, graph export)
- `_requestBytesWithBody(method, path, body)` — POST returning raw bytes (Excel export)

**Error mapping**: HTTP status codes map to typed error classes in `src/errors.ts`. All extend `VyncoError`. The mapping lives in `#throwIfError` in `client.ts`. Includes 409 → `ConflictError`.

**Retry logic**: `#fetchWithRetry` in `client.ts` retries on 429/5xx with exponential backoff (500ms base). Respects `Retry-After` header.

**Response metadata**: Every API response wraps data in `VyncoResponse<T>` which includes `ResponseMeta` parsed from `X-Request-Id`, `X-Credits-Used`, `X-Credits-Remaining`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-Data-Source` headers.

## Conventions

- Zero runtime dependencies — uses native `fetch` only
- All imports use `.js` extensions (required for ESM)
- Resource classes use `#private` fields for the client reference
- Data model interfaces in `src/types.ts` use camelCase matching the API's JSON format
- All endpoints return fully typed responses — no `unknown` return types
- Tests use `msw` (Mock Service Worker) for HTTP-level mocking via `setupServer`
- When testing error codes, set `maxRetries: 0` to avoid retry delays

## Related Projects

- **Rust SDK**: `../VynCorp-rust/vc-rust` — the reference implementation this SDK mirrors
- **VynCorpPortal**: `../../VynCorpPortal/VynCorpPortal` — Next.js frontend that consumes this API
- **ZefixMiner**: `../../ZefixMiner/EY.EW.ASU.ZefixMiner` — .NET backend that serves the API
