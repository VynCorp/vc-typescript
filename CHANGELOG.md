# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-17

### Added

- **VyncoClient** with options-based configuration (`apiKey`, `baseUrl`, `timeout`, `maxRetries`)
- **12 resource modules** covering 45 VynCo API endpoints:
  - `companies` — search, get by UID, count, statistics, change history, board members, dossier, relationships, hierarchy, compare
  - `persons` — get by ID, search by name
  - `dossiers` — generate AI company reports (summary/standard/comprehensive)
  - `apiKeys` — list, create, revoke API keys
  - `credits` — balance, usage breakdown, transaction history
  - `billing` — Stripe checkout and portal sessions
  - `webhooks` — list, create, get, update, delete, test
  - `teams` — get current team, create team
  - `users` — get profile, update profile, change password
  - `settings` — get/update preferences, get/update notifications
  - `analytics` — company stats, cantons, auditors, clustering, anomaly detection, RFM segments, cohorts, cross-tabulation
  - `sync` — data sync status
- **Response metadata** via `VyncoResponse<T>` wrapper exposing API headers:
  - `X-Request-Id` — request tracing
  - `X-Credits-Used` — credits consumed
  - `X-Credits-Remaining` — remaining balance
  - `X-Rate-Limit-Limit` — tier rate limit
  - `X-Data-Source` — OGD compliance (Zefix/LINDAS)
- **Typed error handling** with error classes mapping HTTP status codes:
  - `AuthenticationError` (401), `InsufficientCreditsError` (402), `ForbiddenError` (403)
  - `NotFoundError` (404), `ValidationError` (400/422), `RateLimitError` (429), `ServerError` (5xx)
  - `NetworkError` (connection failures), `DeserializeError` (JSON parse), `TimeoutError`, `ConfigError`
- **Automatic retry** with exponential backoff on 429 and 5xx responses
- **Retry-After header** support for rate-limited requests
- **Dual ESM/CJS output** with TypeScript declarations via tsup
- **Zero runtime dependencies** — uses native `fetch` (Node.js 18+ / browsers)
- **33 tests** with vitest and msw covering auth, error mapping, resource methods, and metadata parsing
