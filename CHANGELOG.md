# Changelog

## 3.1.0 (2026-04-12)

Alignment release matching the reference Python SDK (`vynco` v3.1.0) and Rust
SDK (`vynco` v2.3.0). Adds the full v3.1 API surface: historical timelines,
UBO resolution, similar companies, media-with-sentiment, person-centric
networks, market flow analytics, canton migrations, industry benchmarking,
batch operations, and saved alerts.

### Added

**2 new resources:**

- **`client.alerts`** — saved queries with optional webhook delivery (`list`, `create`, `delete`)
- **`client.ownership`** — ownership-chain trace with circular-ownership detection (`trace`)

**14 new methods on existing resources:**

- `companies.timeline(uid, params?)` — chronological event timeline
- `companies.timelineSummary(uid, params?)` — AI-generated narrative summary
- `companies.similar(uid, params?)` — similar-company scoring on industry/canton/capital/legal form/auditor tier
- `companies.ubo(uid)` — ultimate beneficial owner resolution
- `companies.media(uid, params?)` — news items with optional sentiment filter
- `companies.mediaAnalyze(uid)` — trigger LLM sentiment analysis
- `companies.exportCsv(request)` — canonical CSV export (replaces `exportExcel`, kept as deprecated alias)
- `persons.network(id)` — person-centric network (companies + co-directors + stats)
- `persons.boardMembers(uid, params?)` — now accepts optional `page`/`pageSize` (unpaginated call unchanged)
- `analytics.flows(params?)` — registration/dissolution flows over time
- `analytics.migrations(params?)` — canton-to-canton legal-seat migrations
- `analytics.benchmark(uid, params?)` — company vs industry-peer percentile ranks
- `screening.batch(request)` — batch sanctions screening (up to 100 UIDs)
- `ai.riskScoreBatch(request)` — batch AI risk scoring (up to 50 UIDs)

**New types (40+):**

- `HierarchyEntity` (replaces `unknown` on `HierarchyResponse.parent/subsidiaries/siblings`)
- Timeline: `TimelineParams`, `TimelineEvent`, `TimelineResponse`, `TimelineSummaryResponse`
- Similar: `SimilarParams`, `SimilarCompanyResult`, `SimilarCompaniesResponse`
- UBO/Ownership: `UboPerson`, `ChainLink`, `UboResponse`, `OwnershipRequest`, `OwnershipEntity`, `OwnershipLink`, `PersonCompanyRole`, `KeyPerson`, `CircularFlag`, `OwnershipResponse`
- Media: `MediaParams`, `MediaItem`, `MediaResponse`, `MediaAnalysisResponse`
- Alerts: `Alert`, `CreateAlertRequest`
- Flows/Migrations/Benchmark: `FlowsParams`, `FlowDataPoint`, `FlowsResponse`, `MigrationsParams`, `MigrationFlow`, `MigrationResponse`, `BenchmarkParams`, `BenchmarkDimension`, `BenchmarkResponse`
- Batch: `BatchScreeningRequest`, `BatchScreeningHitSummary`, `BatchScreeningResultByUid`, `BatchScreeningResponse`, `BatchRiskScoreRequest`, `RiskScoreResult`, `BatchRiskScoreResponse`
- Person network: `NetworkPerson`, `NetworkCompany`, `CoDirectorCompany`, `CoDirector`, `NetworkStats`, `PersonNetworkResponse`, `BoardMemberParams`
- Enriched watchlist: `WatchlistCompanyEntry`

**Enrichment provenance fields** (all optional, backwards-compatible):

- `Company.directParentLei`, `ultimateParentLei`, `ultimateParentName`, `gleifParentEnrichedAt` — GLEIF parent linkage
- `Company.industrySource`, `industryConfidence`, `industryClassifiedAt` — industry-classification provenance
- `Classification.industrySource`, `industryConfidence` — same on the classification endpoint
- `Fingerprint.registrationDate` — Swiss register entry date
- `BoardMember.roleSource`, `roleConfidence`, `roleInferredAt` — role extraction provenance
- `PersonRoleDetail`, `PersonEntry`, `NetworkCompany` — same role provenance fields

**Data-coverage disclosure:**

- `UboResponse.dataCoverageNote` — explains when chain is incomplete
- `FlowsResponse.dataCoverageNote` — surfaces asymmetric-accuracy notes (e.g. historical dissolution under-counting)

**Documentation:**

- Non-Swiss GLEIF parents appear as synthetic `LEI:<20-char-lei>` identifiers on
  `UboPerson.controllingEntityUid`, `ChainLink.fromUid`/`toUid`, and
  `OwnershipLink.sourceUid`/`targetUid`. Documented on each interface.

### Changed

- `HierarchyResponse.parent`/`subsidiaries`/`siblings` now use the typed `HierarchyEntity` interface instead of `unknown` — this is a typed-output improvement; callers using `parent as any` will get better type safety.
- `WatchlistCompaniesResponse` now includes an optional typed `companies: WatchlistCompanyEntry[]` field alongside the existing `uids`. The server populates it with name/status/canton for each watched company.

### Deprecated

- `companies.exportExcel(request)` — kept as a deprecated alias for `exportCsv` (the endpoint has always returned CSV; the new name reflects reality). JSDoc `@deprecated` tag emits editor warnings. Will be removed in v4.0.

## 3.0.0 (2026-04-08)

Major release aligning the TypeScript SDK with the Rust SDK (`vynco` v2.2.0) which has reached production state.

### Breaking Changes

- **Base URL** changed from `https://api.vynco.ch` to `https://vynco.ch/api` to match Rust reference.
- **`CompareResponse`** restructured: now has `uids`, `names`, `dimensions` (typed `ComparisonDimension[]`) instead of `companies`, `dimensions` (string[]), `similarities`, `differences`.
- **`HealthResponse`** now typed with `database`, `redis`, `version` fields (removed `uptime`).
- **`DashboardResponse`** now fully typed with `DataCompleteness`, `PipelineStatus[]`, `AuditorTenureStats` instead of `[key: string]: unknown`.
- **`Relationship.sharedPersons`** changed from `number` to `string[]`.
- **`BillingSummary.members`** changed from `number` to `MemberUsage[]`.
- **`WatchlistCompaniesResponse`** changed from `{ companies, total }` to `{ uids }`.
- **`AddCompaniesResponse`** removed `alreadyPresent` field.
- **`CreateWebhookResponse`** restructured to `{ webhook, signingSecret }`.
- **`TestDeliveryResponse`** field `errorMessage` renamed to `error`, removed `deliveredAt`.
- **`BoardMember`** restructured: `name` split into `firstName`/`lastName`, added `roleCategory`, `origin`, `residence`; `id` now required.
- **`CreditLedgerEntry`**: `type` renamed to `entryType`, `id` changed to `number`.
- **`UsageRow`**: `credits` replaced by `count` + `totalCredits`.
- **`CreditUsage.period`** changed from `string` to `UsagePeriod` object.
- **`CreditBalance.overageRate`** now required (was optional).
- **`ClusterResult`**: `topCompanies` renamed to `sampleCompanies`, `centroid` type changed.
- **`RfmSegment`**: `segment` renamed to `name`, removed `avgRecency`/`avgFrequency`/`avgMonetary`, added `description`.
- **`CohortResponse.cohorts`** now typed as `CohortEntry[]` (was `unknown[]`).
- **`NetworkCluster`**: `nodeIds` renamed to `companyUids`, `density` replaced by `sharedPersons`.
- **`ChangeListParams`**: `type` renamed to `changeType`.
- **`AuditCandidateParams`** renamed to `CandidateParams`.
- **`ApiKey`** and **`ApiKeyCreated`**: added `prefix`, `status`, `warning`, `expiresAt` fields; some previously optional fields now required.
- **`Invitation`**: added `teamId`, `token`, `status`, `expiresAt` fields.
- **`AuditorTenure`**: added `companyName` field.
- **`Company`**: 25+ new fields (`currency`, `purpose`, `foundingDate`, `registrationDate`, address fields, `website`, geo fields, `sanctionsHit`, `ehraid`, `oldNames`, etc.).
- **`CompanyListParams`**: 7 new filter fields (`status`, `legalForm`, `capitalMin`, `capitalMax`, `auditorCategory`, `sortBy`, `sortDesc`).
- **Removed** `analytics.statistics()` method (not in Rust reference).
- Several previously optional type fields are now required to match Rust defaults.

### New Company Methods (13)

- `companies.getFull(uid)` — full profile with persons, changes, relationships
- `companies.classification(uid)` — industry classification details
- `companies.structure(uid)` — corporate structure (head offices, branches, M&A)
- `companies.acquisitions(uid)` — M&A acquisition records
- `companies.notes(uid)` — list notes on a company
- `companies.createNote(uid, request)` — create a note
- `companies.updateNote(uid, noteId, request)` — update a note
- `companies.deleteNote(uid, noteId)` — delete a note
- `companies.tags(uid)` — list tags on a company
- `companies.createTag(uid, request)` — create a tag
- `companies.deleteTag(uid, tagId)` — delete a tag
- `companies.allTags()` — list all tags across companies
- `companies.exportExcel(request)` — export companies to Excel/CSV (binary)

### New Person Methods (2)

- `persons.search(params?)` — search persons with pagination
- `persons.get(id)` — get person detail with roles across companies

### New Team Method (1)

- `teams.join(request)` — join a team via invitation token

### New Dossier Method (1)

- `dossiers.generate(uid)` — auto-generate a dossier for a company

### New Types (30+)

- `CompanyFullResponse`, `PersonEntry`, `ChangeEntry`, `RelationshipEntry`
- `Classification`, `CorporateStructure`, `RelatedCompanyEntry`, `Acquisition`
- `Note`, `CreateNoteRequest`, `UpdateNoteRequest`
- `Tag`, `CreateTagRequest`, `TagSummary`
- `ExcelExportRequest`, `ExcelExportFilter`
- `ComparisonDimension`
- `DataCompleteness`, `PipelineStatus`, `AuditorTenureStats`, `LongestTenure`
- `PersonSearchParams`, `PersonSearchResult`, `PersonDetail`, `PersonRoleDetail`
- `JoinTeamRequest`, `JoinTeamResponse`, `MemberUsage`
- `UsagePeriod`, `CohortEntry`, `CandidateParams`

### Other Improvements

- Added `_requestBytesWithBody()` internal method for POST requests returning binary data
- Test coverage expanded from 52 to 86 test cases
- **18 resources, 80+ endpoints** (up from 69)

## 2.0.0 (2026-03-31)

Major release aligning the TypeScript SDK with the Rust SDK (`vynco` v2.0.0).

### Breaking Changes

- **Base URL** changed from `https://api.vynco.ch/v1` to `https://api.vynco.ch` — the `/v1` prefix is now part of each endpoint path. Health check is at `/health` (no `/v1` prefix).
- **Removed resources:** `Watches`, `Notifications`, `Enrichments`, `Users`, `Settings`, `Sync` — replaced by new equivalents or removed from the API.
- **Removed methods:** `companies.search()` (POST), `companies.batch()`, `changes.review()`, `changes.batch()`, `changes.bySogcId()`, `persons.get()`, `persons.search()`, `persons.roles()`, `persons.connections()`, `persons.networkStats()`, `dossiers.generate()`, `dossiers.statistics()`, `analytics.velocity()`.
- **Renamed types:** `PaginatedResponse` -> `PagedResponse`, `UsageBreakdown` -> `CreditUsage`, `ApiKeyInfo` -> `ApiKey`, `CheckoutSessionResponse`/`PortalSessionResponse` -> `SessionUrl`.
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
