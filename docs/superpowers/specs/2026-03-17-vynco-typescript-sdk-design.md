# VynCo TypeScript SDK — Design Specification

## Overview

A TypeScript SDK for the VynCo API (`api.vynco.ch/v1`), providing typed access to Swiss company data, analytics, credit management, and platform administration. This is the TypeScript counterpart to the existing Rust SDK (`vc-rust`), extended with additional endpoints used by VynCorpPortal.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Universal (Browser + Node.js) | Portal runs Next.js (SSR + client); standard `fetch` available everywhere since Node 18 |
| Build | pnpm + tsup | Dual ESM/CJS output, `.d.ts` generation, minimal config |
| Auth | API key only | Simple, matches Rust SDK. Portal can wrap token acquisition externally |
| Scope | Superset of Rust SDK | Covers all Rust SDK endpoints + Portal-only endpoints (analytics, relationships, etc.) |
| Testing | vitest + msw | Fast, modern, HTTP-level mocking without coupling to implementation |
| HTTP | Native `fetch` | No dependencies for HTTP transport; universal runtime support |

## Architecture

### Client & Builder Pattern

```typescript
import { VyncoClient } from "vynco";

const client = new VyncoClient({
  apiKey: "vc_live_...",
  baseUrl: "https://api.vynco.ch/v1", // default
  timeout: 30_000,                     // default: 30s
  maxRetries: 2,                       // default: 2
});

// Resource accessors
const company = await client.companies.get("CHE-123.456.789");
const balance = await client.credits.balance();
```

### Module Structure

```
src/
├── index.ts              # Public re-exports
├── client.ts             # VyncoClient class, HTTP methods, retry logic
├── errors.ts             # VyncoError class hierarchy
├── response.ts           # Response<T> wrapper, ResponseMeta
├── types.ts              # All request/response data models
└── resources/
    ├── index.ts           # Resource re-exports
    ├── companies.ts       # Companies resource (10 methods)
    ├── persons.ts         # Persons resource (2 methods)
    ├── dossiers.ts        # Dossiers resource (1 method)
    ├── api-keys.ts        # API Keys resource (3 methods)
    ├── credits.ts         # Credits resource (3 methods)
    ├── billing.ts         # Billing resource (2 methods)
    ├── webhooks.ts        # Webhooks resource (6 methods)
    ├── teams.ts           # Teams resource (2 methods)
    ├── users.ts           # Users resource (3 methods)
    ├── settings.ts        # Settings resource (4 methods)
    ├── analytics.ts       # Analytics resource (8 methods)
    └── sync.ts            # Sync resource (1 method)
```

### Internal HTTP Layer

The `VyncoClient` exposes internal methods used by resources:

```typescript
// Used by resource classes (not public API)
_request<T>(method: string, path: string): Promise<Response<T>>
_requestWithBody<T, B>(method: string, path: string, body: B): Promise<Response<T>>
_requestWithParams<T>(method: string, path: string, params: Record<string, string>): Promise<Response<T>>
_requestEmpty(method: string, path: string): Promise<ResponseMeta>
```

All methods handle:
- Bearer token injection (`Authorization: Bearer {apiKey}`)
- Response header parsing into `ResponseMeta`
- Error status code mapping to typed errors
- Retry with exponential backoff on 429/5xx
- Timeout via `AbortController`

## Resources & Endpoints

### Companies (10 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `search(params)` | GET | `/companies` | Rust SDK |
| `get(uid)` | GET | `/companies/{uid}` | Rust SDK |
| `count(params)` | GET | `/companies/count` | Rust SDK |
| `statistics()` | GET | `/companies/statistics` | Rust SDK |
| `changes(uid)` | GET | `/companies/{uid}/changes` | Rust SDK |
| `persons(uid)` | GET | `/companies/{uid}/persons` | Rust SDK |
| `dossier(uid)` | GET | `/companies/{uid}/dossier` | Rust SDK |
| `relationships(uid)` | GET | `/companies/{uid}/relationships` | Portal |
| `hierarchy(uid, type?)` | GET | `/companies/{uid}/hierarchy` | Portal |
| `compare(uids)` | POST | `/companies/compare` | Portal |

### Persons (2 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `get(id)` | GET | `/persons/{id}` | Rust SDK |
| `search(params)` | POST | `/persons/search` | Rust SDK |

### Dossiers (1 method)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `generate(uid, request)` | POST | `/dossiers` | Rust SDK |

### API Keys (3 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `list()` | GET | `/api-keys` | Rust SDK |
| `create(request)` | POST | `/api-keys` | Rust SDK |
| `revoke(id)` | DELETE | `/api-keys/{id}` | Rust SDK |

### Credits (3 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `balance()` | GET | `/credits/balance` | Rust SDK |
| `usage(since?)` | GET | `/credits/usage` | Rust SDK |
| `history(limit?, offset?)` | GET | `/credits/history` | Rust SDK |

### Billing (2 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `createCheckout(tier)` | POST | `/billing/checkout` | Rust SDK |
| `createPortal()` | POST | `/billing/portal` | Rust SDK |

### Webhooks (6 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `list()` | GET | `/webhooks` | Rust SDK |
| `create(request)` | POST | `/webhooks` | Rust SDK |
| `get(id)` | GET | `/webhooks/{id}` | Rust SDK |
| `update(id, request)` | PUT | `/webhooks/{id}` | Rust SDK |
| `delete(id)` | DELETE | `/webhooks/{id}` | Rust SDK |
| `test(id)` | POST | `/webhooks/{id}/test` | Rust SDK |

### Teams (2 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `me()` | GET | `/teams/me` | Rust SDK |
| `create(request)` | POST | `/teams` | Rust SDK |

### Users (3 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `me()` | GET | `/auth/me` | Rust SDK |
| `updateProfile(request)` | PUT | `/auth/profile` | Rust SDK |
| `changePassword(request)` | PUT | `/auth/password` | Portal |

### Settings (4 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `getPreferences()` | GET | `/settings/preferences` | Rust SDK |
| `updatePreferences(prefs)` | PUT | `/settings/preferences` | Rust SDK |
| `getNotifications()` | GET | `/settings/notifications` | Portal |
| `updateNotifications(prefs)` | PUT | `/settings/notifications` | Portal |

### Analytics (8 methods)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `companies()` | GET | `/analytics/companies` | Portal |
| `cantons()` | GET | `/analytics/cantons` | Portal |
| `auditors()` | GET | `/analytics/auditors` | Portal |
| `cluster(request)` | POST | `/analytics/cluster` | Portal |
| `anomalies(request)` | POST | `/analytics/anomalies` | Portal |
| `rfmSegments()` | GET | `/analytics/segments/rfm` | Portal |
| `cohorts(params?)` | GET | `/analytics/cohorts` | Portal |
| `crossTabulation(params?)` | GET | `/analytics/cross` | Portal |

### Sync (1 method)

| Method | HTTP | Path | Source |
|--------|------|------|--------|
| `status()` | GET | `/sync/status` | Portal |

**Total: 12 resources, 45 endpoints**

## Data Types

All types use camelCase to match the API's JSON format. Types are derived from the Rust SDK's `types.rs` and Portal's `types.ts`.

### Core Response Types

```typescript
interface Response<T> {
  data: T;
  meta: ResponseMeta;
}

interface ResponseMeta {
  requestId?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  rateLimitLimit?: number;
  dataSource?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Company Types

```typescript
interface Company {
  uid: string;
  name: string;
  legalSeat: string;
  canton: string;
  legalForm: string;
  status: string;
  purpose: string;
  capitalNominal?: number;
  capitalCurrency?: string;
  auditorName?: string;
  registrationDate?: string;
  deletionDate?: string;
  dataSource: string;
  lastModified: string;
}

interface CompanySearchParams {
  search?: string;
  canton?: string;
  legalForm?: string;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

interface CompanyChange {
  id: string;
  companyUid: string;
  changeType: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  detectedAt: string;
  sourceDate?: string;
}

interface PersonRole {
  personId: string;
  firstName: string;
  lastName: string;
  role: string;
  since?: string;
  until?: string;
}

interface CompanyCount {
  count: number;
}

interface CompanyRelationship {
  id: string;
  sourceCompanyUid: string;
  targetCompanyUid: string;
  relationshipType: string;
  sourceLei?: string;
  targetLei?: string;
  dataSource: string;
  isActive: boolean;
}

interface CompanyComparison {
  companies: Company[];
  dimensions: string[];
  similarities: string[];
  differences: string[];
}
```

### Person Types

```typescript
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  roles: PersonRole[];
}

interface PersonSearchParams {
  name: string;
}
```

### Dossier Types

```typescript
interface Dossier {
  id: string;
  companyUid: string;
  status: string;
  executiveSummary?: string;
  keyInsights?: string[];
  riskFactors?: string[];
  generatedAt?: string;
}

interface GenerateDossierRequest {
  level: "summary" | "standard" | "comprehensive" | (string & {});
}
// Note: The resource method merges `uid` into the POST body internally (matching Rust SDK behavior)
```

### Credit & Billing Types

```typescript
interface CreditBalance {
  balance: number;
  monthlyCredits: number;
  usedThisMonth: number;
  tier: string;
  overageRate: number;
}

interface UsageBreakdown {
  operations: UsageOperation[];
  totalDebited: number;
  period?: UsagePeriod;
}

interface UsageOperation {
  operation: string;
  count: number;
  credits: number;
}

interface UsagePeriod {
  start: string;
  end: string;
}

// Note: credits.history() returns unknown (Rust SDK uses serde_json::Value; schema not yet stable)
// Note: companies.statistics() returns unknown for same reason
// Note: analytics endpoints (companies, cantons, auditors, rfmSegments, crossTabulation) also return unknown

interface CheckoutSessionResponse {
  url: string;
}

interface PortalSessionResponse {
  url: string;
}
```

### API Key Types

```typescript
interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  keyHint: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

interface ApiKeyCreated {
  id: string;
  name: string;
  rawKey: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
}

interface CreateApiKeyRequest {
  name: string;
  isTest: boolean;
  permissions: string[];
}
```

### Webhook Types

```typescript
interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  secret?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WebhookCreated {
  id: string;
  url: string;
  events: string[];
  secret: string;
  createdAt?: string;
}

interface CreateWebhookRequest {
  url: string;
  events: string[];
}

interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  status?: string;
}
```

### Team Types

```typescript
interface Team {
  id: string;
  name: string;
  slug: string;
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
  overageRate: number;
  createdAt: string;
}

interface CreateTeamRequest {
  name: string;
  slug: string;
}
```

### User Types

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  creditBalance: number;
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### Analytics Types

```typescript
// CompanyStatistics, analytics returns, and credit history use `unknown` — see note in Credit types above

interface ClusterRequest {
  algorithm?: string;
  k?: number;
  features?: string[];
}

interface ClusterResult {
  algorithm: string;
  k: number;
  clusters: ClusterGroup[];
  metrics: Record<string, number>;
}

interface ClusterGroup {
  id: number;
  size: number;
  centroid: Record<string, number>;
  companies: string[];
}

interface AnomalyRequest {
  algorithm?: string;
  threshold?: number;
}

interface AnomalyResult {
  algorithm: string;
  anomalies: AnomalyEntry[];
  normalCount: number;
  anomalyCount: number;
  anomalyRate: number;
}

interface AnomalyEntry {
  companyUid: string;
  score: number;
  factors: string[];
}

interface CohortResult {
  groupBy: string;
  metric: string;
  cohorts: CohortGroup[];
}

interface CohortGroup {
  label: string;
  count: number;
  value: number;
}

interface SyncStatus {
  lastSync: string;
  status: string;
  recordsProcessed?: number;
  errors?: number;
}
```

## Error Handling

Typed error classes mirroring the Rust SDK's `VyncoError` enum:

```typescript
class VyncoError extends Error {
  constructor(message: string, public readonly body?: ErrorBody) {}
}

class AuthenticationError extends VyncoError {}      // 401
class InsufficientCreditsError extends VyncoError {}  // 402
class ForbiddenError extends VyncoError {}            // 403
class NotFoundError extends VyncoError {}             // 404
class ValidationError extends VyncoError {}           // 400/422
class RateLimitError extends VyncoError {}            // 429
class ServerError extends VyncoError {}               // 5xx
class NetworkError extends VyncoError {}               // fetch failures (DNS, connection refused)
class DeserializeError extends VyncoError {}           // JSON parse failures
class TimeoutError extends VyncoError {}               // AbortController timeout
class ConfigError extends VyncoError {}                // Invalid configuration

interface ErrorBody {
  detail: string;
  message: string;
  status: number;
}
```

Usage:
```typescript
import { VyncoClient, NotFoundError, RateLimitError } from "vynco";

try {
  const resp = await client.companies.get("CHE-000.000.000");
} catch (e) {
  if (e instanceof NotFoundError) console.log("Not found:", e.body?.detail);
  else if (e instanceof RateLimitError) console.log("Rate limited");
  else throw e;
}
```

## Retry Logic

- Retries on HTTP 429 and 5xx responses
- Exponential backoff: `500ms * 2^attempt` (500ms, 1s, 2s, ...)
- Respects `Retry-After` header if present
- Configurable via `maxRetries` (default: 2)
- No retry on 4xx (except 429)

## List Extraction

Utility to handle flexible API response shapes (matching Rust SDK):

```typescript
function extractList<T>(value: unknown): T[]
```

Handles:
1. Bare JSON array: `[{...}]`
2. Wrapped in `data` key: `{ data: [{...}] }`
3. First array-valued key: `{ items: [{...}] }`

## Package Configuration

- **Name**: `vynco`
- **License**: Apache-2.0
- **Engines**: Node.js >= 18
- **Exports**: Dual ESM (`./dist/index.mjs`) + CJS (`./dist/index.cjs`)
- **Types**: `./dist/index.d.ts`
- **Zero runtime dependencies** (uses native `fetch`)

## Testing Strategy

- **vitest** for test runner
- **msw** (Mock Service Worker) for HTTP-level request interception
- Tests mirror the Rust SDK's `test_client.rs` structure:
  - Configuration validation (empty API key)
  - Auth header format
  - Error status code mapping (401, 402, 403, 404, 429, 500)
  - Resource method integration tests
  - Response metadata parsing
- All tests run without network access

## File Inventory

| File | Purpose | Approx Lines |
|------|---------|-------------|
| `package.json` | Package config, scripts, deps | 40 |
| `tsconfig.json` | TypeScript config (strict) | 20 |
| `tsup.config.ts` | Build config (ESM + CJS) | 15 |
| `src/index.ts` | Public re-exports | 20 |
| `src/client.ts` | VyncoClient, HTTP methods, retry | 200 |
| `src/errors.ts` | Error classes | 60 |
| `src/response.ts` | Response<T>, ResponseMeta | 30 |
| `src/types.ts` | All data model interfaces | 250 |
| `src/resources/index.ts` | Resource re-exports | 15 |
| `src/resources/companies.ts` | Companies resource | 80 |
| `src/resources/persons.ts` | Persons resource | 25 |
| `src/resources/dossiers.ts` | Dossiers resource | 20 |
| `src/resources/api-keys.ts` | API Keys resource | 30 |
| `src/resources/credits.ts` | Credits resource | 35 |
| `src/resources/billing.ts` | Billing resource | 25 |
| `src/resources/webhooks.ts` | Webhooks resource | 50 |
| `src/resources/teams.ts` | Teams resource | 25 |
| `src/resources/users.ts` | Users resource | 30 |
| `src/resources/settings.ts` | Settings resource | 35 |
| `src/resources/analytics.ts` | Analytics resource | 60 |
| `src/resources/sync.ts` | Sync resource | 15 |
| `tests/client.test.ts` | Client + resource tests | 300 |
| **Total** | | **~1,400** |
