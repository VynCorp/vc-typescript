# vynco

TypeScript SDK for the [VynCo](https://vynco.ch) Swiss Corporate Intelligence API.

## Installation

```bash
npm install vynco
# or
pnpm add vynco
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

## Response Metadata

Every response includes header metadata:

```typescript
const resp = await client.companies.get("CHE-100.023.968");

console.log(resp.meta.requestId);
console.log(resp.meta.creditsUsed);
console.log(resp.meta.creditsRemaining);
console.log(resp.meta.rateLimitLimit);
console.log(resp.meta.dataSource);
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

## Error Handling

```typescript
import { VyncoClient, NotFoundError, RateLimitError, InsufficientCreditsError, AuthenticationError } from "vynco";

try {
  const resp = await client.companies.get("CHE-000.000.000");
  console.log(resp.data.name);
} catch (e) {
  if (e instanceof NotFoundError) console.log(`Not found: ${e.body?.detail}`);
  else if (e instanceof RateLimitError) console.log("Rate limited, try again later");
  else if (e instanceof InsufficientCreditsError) console.log("Top up credits");
  else if (e instanceof AuthenticationError) console.log("Check your API key");
  else throw e;
}
```

## License

Apache-2.0
