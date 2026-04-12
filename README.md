# @vynco/sdk

TypeScript SDK for the [VynCo Swiss Corporate Intelligence API](https://vynco.ch). Access 780,000+ Swiss companies with historical timelines, change tracking, sanctions screening, AI-powered risk analysis, UBO resolution, network graphs, watchlists, webhooks, market-flow analytics, and bulk data exports.

Zero runtime dependencies. Works in Node.js 18+ and modern browsers.

## Installation

```bash
npm install @vynco/sdk
# or
pnpm add @vynco/sdk
# or
yarn add @vynco/sdk
```

## Quick Start

```typescript
import { VyncoClient } from "@vynco/sdk";

const client = new VyncoClient({ apiKey: "vc_live_your_api_key" });

// Check API health
const health = await client.health.check();
console.log(health.data.status);

// Search companies
const companies = await client.companies.list({ search: "Novartis", canton: "BS" });
console.log(`Found ${companies.data.total} companies`);

// Get company details
const company = await client.companies.get("CHE-105.805.649");
console.log(company.data.name);

// Get full company profile with persons, changes, relationships
const full = await client.companies.getFull("CHE-105.805.649");
console.log(`${full.data.persons.length} board members`);

// Screen a name against sanctions lists
const screening = await client.screening.screen({ name: "Test Corp" });
console.log(`Risk level: ${screening.data.riskLevel}`);

// AI-powered risk scoring
const risk = await client.ai.riskScore({ uid: "CHE-105.805.649" });
console.log(`Score: ${risk.data.overallScore}/100`);
```

## Configuration

```typescript
import { VyncoClient } from "@vynco/sdk";

const client = new VyncoClient({
  apiKey: "vc_live_your_api_key",  // required — vc_live_* or vc_test_*
  baseUrl: "https://vynco.ch/api", // default
  timeout: 30_000,                 // default: 30s
  maxRetries: 2,                   // default: 2 (retries on 429 & 5xx)
});
```

## API Coverage

| Resource | Methods | Description |
|----------|---------|-------------|
| `client.health` | `check` | API health status |
| `client.companies` | `list`, `get`, `getFull`, `count`, `events`, `statistics`, `compare`, `news`, `reports`, `relationships`, `hierarchy`, `classification`, `fingerprint`, `structure`, `acquisitions`, `nearby`, `timeline`, `timelineSummary`, `similar`, `ubo`, `media`, `mediaAnalyze`, `notes`, `createNote`, `updateNote`, `deleteNote`, `tags`, `createTag`, `deleteTag`, `allTags`, `exportCsv` | Swiss company data |
| `client.auditors` | `history`, `tenures` | Auditor appointment history |
| `client.dashboard` | `get` | Dashboard summary data |
| `client.screening` | `screen`, `batch` | Sanctions & watchlist screening |
| `client.watchlists` | `list`, `create`, `delete`, `companies`, `addCompanies`, `removeCompany`, `events` | Company monitoring lists |
| `client.webhooks` | `list`, `create`, `update`, `delete`, `test`, `deliveries` | Event delivery subscriptions |
| `client.exports` | `create`, `get`, `download` | Bulk data exports |
| `client.ai` | `dossier`, `search`, `riskScore`, `riskScoreBatch` | AI-powered intelligence |
| `client.apiKeys` | `list`, `create`, `revoke` | API key management |
| `client.credits` | `balance`, `usage`, `history` | Credit balance & usage |
| `client.billing` | `createCheckout`, `createPortal` | Stripe billing sessions |
| `client.teams` | `me`, `create`, `members`, `inviteMember`, `updateMemberRole`, `removeMember`, `billingSummary`, `join` | Team management |
| `client.changes` | `list`, `byCompany`, `statistics` | SOGC company change feed |
| `client.persons` | `boardMembers`, `search`, `get`, `network` | Board member & person data |
| `client.analytics` | `cantons`, `auditors`, `cluster`, `anomalies`, `rfmSegments`, `cohorts`, `candidates`, `flows`, `migrations`, `benchmark` | Analytics & insights |
| `client.dossiers` | `create`, `list`, `get`, `delete`, `generate` | Company dossier reports |
| `client.graph` | `get`, `export`, `analyze` | Corporate relationship graphs |
| `client.alerts` | `list`, `create`, `delete` | Saved queries with webhook delivery |
| `client.ownership` | `trace` | Ownership-chain trace with circular detection |

**20 resources, 100+ endpoints.**

### New in v3.1

- **Historical timeline** — `companies.timeline(uid, params?)` and AI narrative via `timelineSummary(uid, params?)`
- **Similar companies** — `companies.similar(uid, { limit })` scored on industry, canton, capital, legal form, auditor tier
- **UBO resolution** — `companies.ubo(uid)` walks the ownership chain and identifies natural persons
- **Ownership trace** — `ownership.trace(uid, { maxDepth })` exposes the full chain with circular-ownership detection
- **Media with sentiment** — `companies.media(uid, { sentiment })` filtered by positive/neutral/negative
- **Batch operations** — `screening.batch({ uids })` (up to 100) and `ai.riskScoreBatch({ uids })` (up to 50)
- **Market analytics** — `analytics.flows(params?)`, `analytics.migrations(params?)`, `analytics.benchmark(uid, params?)`
- **Person network** — `persons.network(id)` for person-centric investigations with co-directors
- **Saved alerts** — persistent saved queries with optional webhook delivery
- **Pagination on board_members** — `persons.boardMembers(uid, { page, pageSize })` (max 500)
- **Typed hierarchy** — `HierarchyResponse` now uses `HierarchyEntity` (was `unknown`)
- **Enriched watchlists** — `WatchlistCompaniesResponse.companies` includes name/status/canton
- **`exportCsv`** — new canonical name (`exportExcel` kept as `@deprecated` alias)

## Response Metadata

Every response includes metadata parsed from API headers:

```typescript
const resp = await client.companies.get("CHE-105.805.649");

console.log(resp.data);                    // Company object
console.log(resp.meta.requestId);          // X-Request-Id
console.log(resp.meta.creditsUsed);        // X-Credits-Used
console.log(resp.meta.creditsRemaining);   // X-Credits-Remaining
console.log(resp.meta.rateLimitLimit);     // X-RateLimit-Limit
console.log(resp.meta.rateLimitRemaining); // X-RateLimit-Remaining
console.log(resp.meta.rateLimitReset);     // X-RateLimit-Reset (Unix timestamp)
console.log(resp.meta.dataSource);         // X-Data-Source
```

## Error Handling

All errors extend `VyncoError` with typed subclasses:

```typescript
import { VyncoClient, NotFoundError, RateLimitError, VyncoError } from "@vynco/sdk";

try {
  await client.companies.get("CHE-000.000.000");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log("Company not found");
  } else if (err instanceof RateLimitError) {
    console.log("Rate limited — retry later");
  } else if (err instanceof VyncoError) {
    console.log(`API error: ${err.message}`, err.body);
  }
}
```

| Error Class | HTTP Status |
|-------------|-------------|
| `AuthenticationError` | 401 |
| `InsufficientCreditsError` | 402 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `ValidationError` | 400, 422 |
| `RateLimitError` | 429 |
| `ServerError` | 5xx |
| `NetworkError` | Connection failures |
| `TimeoutError` | Request timeout |
| `ConfigError` | Invalid configuration |

## Retry Logic

The client automatically retries on `429` (rate limit) and `5xx` (server errors) with exponential backoff:

- **Default retries:** 2
- **Backoff:** 500ms, 1s, 2s, ...
- **Respects** `Retry-After` header when present
- **No retry** on `4xx` errors (except 429)

Set `maxRetries: 0` to disable retries.

## License

Apache-2.0
