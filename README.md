# vynco

TypeScript SDK for the [VynCo](https://vynco.ch) Swiss Corporate Intelligence API.

Zero runtime dependencies. Works in Node.js 18+ and browsers.

## Installation

```bash
npm install vynco
# or
pnpm add vynco
# or
yarn add vynco
```

## Quick Start

```typescript
import { VyncoClient } from "vynco";

const client = new VyncoClient({ apiKey: "vc_live_your_api_key" });

// Search companies
const resp = await client.companies.search({ search: "Novartis", canton: "BS" });
console.log(`Found ${resp.data.total} companies`);
console.log(`Credits used: ${resp.meta.creditsUsed}`);

// Get company details
const company = await client.companies.get("CHE-100.023.968");
console.log(`${company.data.name}: ${company.data.purpose}`);

// Check credit balance
const balance = await client.credits.balance();
console.log(`Balance: ${balance.data.balance} credits`);
```

## Configuration

```typescript
const client = new VyncoClient({
  apiKey: "vc_live_your_api_key",
  baseUrl: "https://api.vynco.ch/v1", // default
  timeout: 60_000,                     // default: 30s
  maxRetries: 3,                       // default: 2
});
```

API keys use the prefixes `vc_live_*` (production) and `vc_test_*` (sandbox).

## Resources

| Resource | Methods |
|----------|---------|
| `companies` | `search`, `get`, `count`, `statistics`, `changes`, `persons`, `dossier`, `relationships`, `hierarchy`, `compare` |
| `persons` | `get`, `search` |
| `dossiers` | `generate` |
| `apiKeys` | `list`, `create`, `revoke` |
| `credits` | `balance`, `usage`, `history` |
| `billing` | `createCheckout`, `createPortal` |
| `webhooks` | `list`, `create`, `get`, `update`, `delete`, `test` |
| `teams` | `me`, `create` |
| `users` | `me`, `updateProfile`, `changePassword` |
| `settings` | `getPreferences`, `updatePreferences`, `getNotifications`, `updateNotifications` |
| `analytics` | `companies`, `cantons`, `auditors`, `cluster`, `anomalies`, `rfmSegments`, `cohorts`, `crossTabulation` |
| `sync` | `status` |

### Companies

```typescript
// Search with filters and pagination
const results = await client.companies.search({
  search: "Nestlé",
  canton: "VD",
  legalForm: "AG",
  page: 1,
  pageSize: 20,
});

// Get by UID
const company = await client.companies.get("CHE-100.023.968");

// Count matching companies
const count = await client.companies.count({ canton: "ZH" });

// Change history
const changes = await client.companies.changes("CHE-100.023.968");

// Board members
const persons = await client.companies.persons("CHE-100.023.968");

// Company relationships and hierarchy
const rels = await client.companies.relationships("CHE-100.023.968");
const tree = await client.companies.hierarchy("CHE-100.023.968");

// Compare multiple companies
const comparison = await client.companies.compare(["CHE-100.023.968", "CHE-105.962.705"]);
```

### Dossiers

```typescript
// Generate an AI-powered company dossier
const dossier = await client.dossiers.generate("CHE-100.023.968", {
  level: "comprehensive", // "summary" (20 credits) | "standard" (50) | "comprehensive" (100)
});
```

### Credits & Billing

```typescript
const balance = await client.credits.balance();
console.log(`${balance.data.balance} credits remaining`);

const usage = await client.credits.usage("2026-01-01");
const history = await client.credits.history(50, 0);

// Stripe billing
const checkout = await client.billing.createCheckout("professional");
const portal = await client.billing.createPortal();
```

### API Keys

```typescript
const keys = await client.apiKeys.list();

const newKey = await client.apiKeys.create({
  name: "CI Pipeline",
  isTest: false,
  permissions: ["read"],
});
console.log(newKey.data.rawKey); // shown only once

await client.apiKeys.revoke("key-id");
```

### Webhooks

```typescript
const webhook = await client.webhooks.create({
  url: "https://example.com/hook",
  events: ["company.changed"],
});
console.log(webhook.data.secret); // signing secret, shown only once

await client.webhooks.update("wh-id", { status: "inactive" });
await client.webhooks.test("wh-id");
await client.webhooks.delete("wh-id");
```

### Analytics

```typescript
const clusters = await client.analytics.cluster({ algorithm: "kmeans", k: 5 });
const anomalies = await client.analytics.anomalies({ threshold: 0.95 });
const cohorts = await client.analytics.cohorts();
const rfm = await client.analytics.rfmSegments();
```

## Response Metadata

Every response includes parsed API headers:

```typescript
const resp = await client.companies.get("CHE-100.023.968");

resp.meta.requestId;        // X-Request-Id — request tracing
resp.meta.creditsUsed;      // X-Credits-Used — credits consumed
resp.meta.creditsRemaining; // X-Credits-Remaining — remaining balance
resp.meta.rateLimitLimit;   // X-Rate-Limit-Limit — tier rate limit
resp.meta.dataSource;       // X-Data-Source — OGD compliance (Zefix/LINDAS)
```

## Error Handling

All API errors map to typed error classes with `instanceof` support:

```typescript
import {
  VyncoClient,
  AuthenticationError,
  InsufficientCreditsError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "vynco";

try {
  const resp = await client.companies.get("CHE-000.000.000");
} catch (e) {
  if (e instanceof NotFoundError) console.log(`Not found: ${e.body?.detail}`);
  else if (e instanceof RateLimitError) console.log("Rate limited, try again later");
  else if (e instanceof InsufficientCreditsError) console.log("Top up credits");
  else if (e instanceof AuthenticationError) console.log("Check your API key");
  else throw e;
}
```

| Error Class | HTTP Status | Description |
|-------------|-------------|-------------|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `InsufficientCreditsError` | 402 | Credit balance too low |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ValidationError` | 400/422 | Invalid request parameters |
| `RateLimitError` | 429 | Too many requests |
| `ServerError` | 5xx | Server-side failure |
| `NetworkError` | — | Connection/DNS failure |
| `TimeoutError` | — | Request exceeded timeout |
| `ConfigError` | — | Invalid client configuration |

## Retry Logic

The client automatically retries on HTTP 429 (rate limit) and 5xx (server error) responses:

- Exponential backoff: 500ms, 1s, 2s, 4s, ...
- Respects `Retry-After` header when present
- Configurable via `maxRetries` (default: 2)
- No retry on 4xx errors (except 429)

## License

Apache-2.0
