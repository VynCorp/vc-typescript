# Changelog

## 2.0.0 (2026-03-31)

Major release aligning the TypeScript SDK with the Rust SDK (`vynco` v2.0.0).

### Breaking Changes

- **Base URL** changed from `https://api.vynco.ch/v1` to `https://api.vynco.ch` — the `/v1` prefix is now part of each endpoint path. Health check is at `/health` (no `/v1` prefix).
- **Removed resources:** `Watches`, `Notifications`, `Enrichments`, `Users`, `Settings`, `Sync` — replaced by new equivalents or removed from the API.
- **Removed methods:** `companies.search()` (POST), `companies.batch()`, `changes.review()`, `changes.batch()`, `changes.bySogcId()`, `persons.get()`, `persons.search()`, `persons.roles()`, `persons.connections()`, `persons.networkStats()`, `dossiers.generate()`, `dossiers.statistics()`, `analytics.velocity()`.
- **Renamed types:** `PaginatedResponse` → `PagedResponse`, `UsageBreakdown` → `CreditUsage`, `ApiKeyInfo` → `ApiKey`, `CheckoutSessionResponse`/`PortalSessionResponse` → `SessionUrl`.
- **Changed method signatures:** `companies.compare()` now takes `CompareRequest` object, `dossiers.create()` replaces `dossiers.generate()`, `changes.byCompany()` replaces `changes.get()`.
- **Type changes:** `CompanyChange`, `ChangeListParams`, `ChangeStatistics`, `Company`, `CompanyStatistics`, `Team`, `CreateTeamRequest`, `CreateApiKeyRequest`, `ApiKeyCreated`, `Dossier` fields updated to match API.
- **ResponseMeta:** Rate limit headers changed from `x-rate-limit-limit` to `x-ratelimit-limit` (no hyphen). Added `rateLimitRemaining` and `rateLimitReset`.

### New Resources (8)

- **`auditors`** — `history(uid)`, `tenures(params?)` — auditor appointment history and long-tenure queries.
- **`dashboard`** — `get()` — dashboard summary data.
- **`screening`** — `screen(request)` — sanctions and watchlist screening.
- **`watchlists`** — `list()`, `create()`, `delete()`, `companies()`, `addCompanies()`, `removeCompany()`, `events()` — company monitoring lists with events.
- **`webhooks`** — `list()`, `create()`, `update()`, `delete()`, `test()`, `deliveries()` — webhook subscriptions with signing secrets and delivery tracking.
- **`exports`** — `create()`, `get()`, `download()` — bulk data export jobs with binary file downloads.
- **`ai`** — `dossier()`, `search()`, `riskScore()` — AI-powered company intelligence, natural language search, and risk scoring.
- **`graph`** — `get()`, `export()`, `analyze()` — corporate relationship graphs with network analysis.

### New Company Methods (5)

- `companies.events(uid, limit?)` — company change events (CloudEvent format)
- `companies.reports(uid)` — financial report metadata
- `companies.fingerprint(uid)` — extended company data profile
- `companies.nearby(params)` — geo-proximity company search
- `companies.relationships(uid)` — now returns typed `Relationship[]`

### New Team Methods (5)

- `teams.members()` — list team members
- `teams.inviteMember(request)` — invite by email
- `teams.updateMemberRole(id, request)` — change member role
- `teams.removeMember(id)` — remove a member
- `teams.billingSummary()` — team billing overview

### New Analytics Methods (4)

- `analytics.anomalies(request)` — anomaly detection
- `analytics.cohorts(params?)` — cohort analysis
- `analytics.statistics()` — company statistics
- `analytics.candidates(params?)` — audit candidate ranking

### Other Improvements

- Added `ConflictError` (HTTP 409) to error mapping
- Added `_requestBytes()` internal method for binary file downloads
- Credits `history()` now returns typed `CreditHistory` instead of `unknown`
- Analytics `cantons()` and `auditors()` return typed arrays instead of `AnalyticsResult`
- GitHub Actions publish workflow now creates a GitHub Release automatically
- CI workflow now includes package verification step

## 1.0.0 (2026-03-18)

Initial major release.

- 16 resource modules covering 60+ API endpoints
- Response metadata wrapper with API headers
- Typed error handling (11 error classes)
- Automatic retry with exponential backoff
- Dual ESM/CJS output with zero dependencies

## 0.1.0 (2026-03-17)

Alpha release.
