// --- Pagination ---

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Health ---

export interface HealthResponse {
  status: string;
  database: string;
  redis: string;
  version: string;
}

// --- Companies ---

export interface Company {
  uid: string;
  name: string;
  canton?: string;
  status?: string;
  legalForm?: string;
  shareCapital?: number;
  currency?: string;
  purpose?: string;
  foundingDate?: string;
  registrationDate?: string;
  deletionDate?: string;
  legalSeat?: string;
  municipality?: string;
  dataSource?: string;
  enrichmentLevel?: string;
  addressStreet?: string;
  addressHouseNumber?: string;
  addressZipCode?: string;
  addressCity?: string;
  addressCanton?: string;
  website?: string;
  industry?: string;
  subIndustry?: string;
  employeeCount?: number;
  auditorName?: string;
  auditorCategory?: string;
  latitude?: number;
  longitude?: number;
  geoPrecision?: string;
  nogaCode?: string;
  sanctionsHit?: boolean;
  lastScreenedAt?: string;
  isFinmaRegulated?: boolean;
  ehraid?: number;
  chid?: string;
  cantonalExcerptUrl?: string;
  oldNames?: string[];
  translations?: string[];
  updatedAt?: string;
  // Enrichment provenance (v3.1+)
  /** GLEIF-sourced direct parent LEI. */
  directParentLei?: string;
  /** GLEIF-sourced ultimate parent LEI. Non-Swiss parents appear as `LEI:<20-char-lei>`. */
  ultimateParentLei?: string;
  /** Cached name of the ultimate parent. */
  ultimateParentName?: string;
  /** Timestamp when GLEIF parent enrichment last ran. */
  gleifParentEnrichedAt?: string;
  /** Source of the industry classification: `"zefix"`, `"keyword_match"`, or `"llm"`. */
  industrySource?: string;
  /** Confidence (0–1) for LLM-classified industries. */
  industryConfidence?: number;
  /** Timestamp when the industry classification was last computed. */
  industryClassifiedAt?: string;
}

export interface CompanyListParams {
  search?: string;
  canton?: string;
  changedSince?: string;
  status?: string;
  legalForm?: string;
  capitalMin?: number;
  capitalMax?: number;
  auditorCategory?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CompanyCount {
  count: number;
}

export interface CompanyStatistics {
  total: number;
  byStatus: Record<string, number>;
  byCanton: Record<string, number>;
  byLegalForm: Record<string, number>;
}

// --- Company full (composite endpoint) ---

export interface CompanyFullResponse {
  company: Company;
  persons: PersonEntry[];
  recentChanges: ChangeEntry[];
  relationships: RelationshipEntry[];
}

export interface PersonEntry {
  personId?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  since?: string;
  until?: string;
  // Enrichment provenance (v3.1+)
  roleSource?: string;
  roleConfidence?: number;
  roleInferredAt?: string;
}

export interface ChangeEntry {
  id: string;
  companyUid: string;
  changeType?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  detectedAt: string;
  sourceDate?: string;
}

export interface RelationshipEntry {
  relatedUid: string;
  relatedName?: string;
  relationshipType: string;
}

// --- Events ---

export interface CompanyEvent {
  id: string;
  ceType: string;
  ceSource: string;
  ceTime: string;
  companyUid: string;
  companyName: string;
  category: string;
  severity: string;
  summary: string;
  detailJson: unknown;
  createdAt: string;
}

export interface EventListResponse {
  events: CompanyEvent[];
  count: number;
}

// --- Compare ---

export interface CompareRequest {
  uids: string[];
}

export interface CompareResponse {
  uids: string[];
  names: string[];
  dimensions: ComparisonDimension[];
}

export interface ComparisonDimension {
  field: string;
  label: string;
  values: (string | null)[];
}

// --- Company Extended ---

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  sourceType: string;
  publishedAt: string;
  url?: string;
}

export interface CompanyReport {
  reportType: string;
  fiscalYear?: number;
  description: string;
  sourceUrl?: string;
  publicationDate: string;
}

export interface Relationship {
  relatedUid: string;
  relatedName: string;
  relationshipType: string;
  sharedPersons: string[];
}

export interface HierarchyEntity {
  uid: string;
  name: string;
  confidence?: string;
  sharedPersonCount?: number;
  sharedPersons?: string[];
}

export interface HierarchyResponse {
  parent?: HierarchyEntity;
  subsidiaries: HierarchyEntity[];
  siblings: HierarchyEntity[];
}

export interface Fingerprint {
  companyUid: string;
  name: string;
  industrySector?: string;
  industryGroup?: string;
  industry?: string;
  sizeCategory?: string;
  employeeCountEstimate?: number;
  capitalAmount?: number;
  capitalCurrency?: string;
  revenue?: number;
  netIncome?: number;
  auditorTier?: string;
  changeFrequency: number;
  boardSize: number;
  companyAge: number;
  canton: string;
  legalForm: string;
  hasParentCompany: boolean;
  subsidiaryCount: number;
  generatedAt: string;
  fingerprintVersion: string;
  /** Swiss register entry date (v3.1+). */
  registrationDate?: string;
}

export interface NearbyCompany {
  uid: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}

// --- Classification ---

export interface Classification {
  companyUid: string;
  sectorCode?: string;
  sectorName?: string;
  groupCode?: string;
  groupName?: string;
  industryCode?: string;
  industryName?: string;
  subIndustryCode?: string;
  subIndustryName?: string;
  method: string;
  classifiedAt: string;
  auditorCategory?: string;
  isFinmaRegulated: boolean;
  // Enrichment provenance (v3.1+)
  industrySource?: string;
  industryConfidence?: number;
}

// --- Corporate Structure ---

export interface CorporateStructure {
  headOffices: RelatedCompanyEntry[];
  branchOffices: RelatedCompanyEntry[];
  acquisitions: RelatedCompanyEntry[];
  acquiredBy: RelatedCompanyEntry[];
}

export interface RelatedCompanyEntry {
  uid: string;
  name: string;
}

// --- Acquisitions ---

export interface Acquisition {
  acquirerUid: string;
  acquiredUid: string;
  acquirerName?: string;
  acquiredName?: string;
  createdAt: string;
}

// --- Notes ---

export interface Note {
  id: string;
  companyUid: string;
  content: string;
  noteType: string;
  rating?: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
  noteType?: string;
  rating?: number;
  isPrivate?: boolean;
}

export interface UpdateNoteRequest {
  content?: string;
  noteType?: string;
  rating?: number;
  isPrivate?: boolean;
}

// --- Tags ---

export interface Tag {
  id: string;
  companyUid: string;
  tagName: string;
  color?: string;
  createdAt: string;
}

export interface CreateTagRequest {
  tagName: string;
  color?: string;
}

export interface TagSummary {
  tagName: string;
  count: number;
}

// --- Excel Export ---

export interface ExcelExportRequest {
  uids?: string[];
  filter?: ExcelExportFilter;
  fields?: string[];
}

export interface ExcelExportFilter {
  canton?: string;
  search?: string;
  status?: string;
  auditorCategory?: string;
}

// --- Auditors ---

export interface AuditorHistoryResponse {
  companyUid: string;
  companyName: string;
  currentAuditor?: AuditorTenure;
  history: AuditorTenure[];
}

export interface AuditorTenure {
  id: string;
  companyUid: string;
  companyName: string;
  auditorName: string;
  appointedAt?: string;
  resignedAt?: string;
  tenureYears?: number;
  isCurrent: boolean;
  source: string;
}

export interface AuditorTenureParams {
  minYears?: number;
  canton?: string;
  page?: number;
  pageSize?: number;
}

// --- Dashboard ---

export interface DashboardResponse {
  generatedAt: string;
  data: DataCompleteness;
  pipelines: PipelineStatus[];
  auditorTenures: AuditorTenureStats;
}

export interface DataCompleteness {
  totalCompanies: number;
  enrichedCompanies: number;
  companiesWithIndustry: number;
  companiesWithGeo: number;
  totalPersons: number;
  totalChanges: number;
  totalSogcPublications: number;
}

export interface PipelineStatus {
  id: string;
  status: string;
  itemsProcessed: number;
  lastCompletedAt?: string;
}

export interface AuditorTenureStats {
  totalTracked: number;
  currentAuditors: number;
  tenuresOver10Years: number;
  tenuresOver7Years: number;
  avgTenureYears: number;
  longestTenure?: LongestTenure;
}

export interface LongestTenure {
  companyUid: string;
  companyName: string;
  auditorName: string;
  tenureYears: number;
}

// --- Screening ---

export interface ScreeningRequest {
  name: string;
  uid?: string;
  sources?: string[];
}

export interface ScreeningResponse {
  queryName: string;
  queryUid?: string;
  screenedAt: string;
  hitCount: number;
  riskLevel: string;
  hits: ScreeningHit[];
  sourcesChecked: string[];
}

export interface ScreeningHit {
  source: string;
  matchedName: string;
  entityType: string;
  score: number;
  datasets: string[];
  details: unknown;
}

// --- Watchlists ---

export interface WatchlistSummary {
  id: string;
  name: string;
  description: string;
  companyCount: number;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWatchlistRequest {
  name: string;
  description?: string;
}

export interface WatchlistCompanyEntry {
  uid: string;
  name?: string;
  status?: string;
  canton?: string;
}

export interface WatchlistCompaniesResponse {
  uids: string[];
  /** Enriched company entries with name/status/canton (v3.1+). */
  companies?: WatchlistCompanyEntry[];
}

export interface AddCompaniesRequest {
  uids: string[];
}

export interface AddCompaniesResponse {
  added: number;
}

// --- Webhooks ---

export interface WebhookSubscription {
  id: string;
  url: string;
  description: string;
  eventFilters: string[];
  companyFilters: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  description?: string;
  eventFilters?: string[];
  companyFilters?: string[];
}

export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  eventFilters?: string[];
  companyFilters?: string[];
  status?: string;
}

export interface CreateWebhookResponse {
  webhook: WebhookSubscription;
  signingSecret: string;
}

export interface TestDeliveryResponse {
  success: boolean;
  httpStatus?: number;
  error?: string;
}

export interface WebhookDelivery {
  id: string;
  eventId: string;
  status: string;
  attempt: number;
  httpStatus?: number;
  errorMessage?: string;
  deliveredAt?: string;
  createdAt: string;
}

// --- Exports ---

export interface CreateExportRequest {
  format?: string;
  canton?: string;
  status?: string;
  changedSince?: string;
  industry?: string;
  maxRows?: number;
}

export interface ExportJob {
  id: string;
  status: string;
  format: string;
  totalRows?: number;
  fileSizeBytes?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface ExportDownload {
  job: ExportJob;
  data?: string;
}

export interface ExportFile {
  bytes: ArrayBuffer;
  contentType: string;
  filename: string;
}

// --- AI ---

export interface AiDossierRequest {
  uid: string;
  depth?: string;
}

export interface AiDossierResponse {
  uid: string;
  companyName: string;
  dossier: string;
  sources: string[];
  generatedAt: string;
}

export interface AiSearchRequest {
  query: string;
}

export interface AiSearchResponse {
  query: string;
  explanation: string;
  filtersApplied: unknown;
  results: unknown[];
  total: number;
}

export interface RiskScoreRequest {
  uid: string;
}

export interface RiskScoreResponse {
  uid: string;
  companyName: string;
  overallScore: number;
  riskLevel: string;
  breakdown: RiskFactor[];
  assessedAt: string;
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

// --- API Keys ---

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  environment: string;
  scopes: string[];
  status: string;
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiKeyCreated {
  key: string;
  id: string;
  name: string;
  prefix: string;
  environment: string;
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
  warning: string;
}

export interface CreateApiKeyRequest {
  name?: string;
  environment?: string;
  scopes?: string[];
}

// --- Credits ---

export interface CreditBalance {
  balance: number;
  monthlyCredits: number;
  usedThisMonth: number;
  tier: string;
  overageRate: number;
}

export interface CreditUsage {
  operations: UsageRow[];
  total: number;
  period: UsagePeriod;
}

export interface UsagePeriod {
  since: string;
  until: string;
}

export interface UsageRow {
  operation: string;
  count: number;
  totalCredits: number;
}

export interface CreditHistory {
  items: CreditLedgerEntry[];
  total: number;
}

export interface CreditLedgerEntry {
  id: number;
  entryType: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

// --- Billing ---

export interface SessionUrl {
  url: string;
}

export interface CheckoutRequest {
  tier: string;
}

// --- Teams ---

export interface Team {
  id: string;
  name: string;
  slug: string;
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
}

export interface CreateTeamRequest {
  name?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt?: string;
}

export interface InviteMemberRequest {
  email: string;
  role?: string;
}

export interface UpdateMemberRoleRequest {
  role: string;
}

export interface Invitation {
  id: string;
  teamId: string;
  email: string;
  role: string;
  token: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export interface JoinTeamRequest {
  token: string;
}

export interface JoinTeamResponse {
  teamId: string;
  teamName: string;
  role: string;
}

export interface BillingSummary {
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
  usedThisMonth: number;
  members: MemberUsage[];
}

export interface MemberUsage {
  userId: string;
  name: string;
  creditsUsed: number;
}

// --- Changes ---

export interface CompanyChange {
  id: string;
  companyUid: string;
  companyName?: string;
  changeType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  source?: string;
  detectedAt: string;
}

export interface ChangeListParams {
  changeType?: string;
  since?: string;
  until?: string;
  companySearch?: string;
  page?: number;
  pageSize?: number;
}

export interface ChangeStatistics {
  totalChanges: number;
  changesThisWeek: number;
  changesThisMonth: number;
  byType: unknown;
}

// --- Persons ---

export interface BoardMember {
  id: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roleCategory: string;
  origin?: string;
  residence?: string;
  signingAuthority?: string;
  since?: string;
  // Enrichment provenance (v3.1+)
  roleSource?: string;
  roleConfidence?: number;
  roleInferredAt?: string;
}

export interface BoardMemberParams {
  page?: number;
  pageSize?: number;
}

export interface PersonSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PersonSearchResult {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  placeOfOrigin?: string;
  nationality?: string;
  roleCount?: number;
}

export interface PersonDetail {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  placeOfOrigin?: string;
  residence?: string;
  nationality?: string;
  roles: PersonRoleDetail[];
}

export interface PersonRoleDetail {
  companyUid: string;
  companyName?: string;
  roleFunction: string;
  roleCategory: string;
  signingAuthority?: string;
  startDate?: string;
  endDate?: string;
  changeAction?: string;
  isCurrent?: boolean;
  // Enrichment provenance (v3.1+)
  roleSource?: string;
  roleConfidence?: number;
  roleInferredAt?: string;
}

// --- Analytics ---

export interface CantonDistribution {
  canton: string;
  count: number;
  percentage: number;
}

export interface AuditorMarketShare {
  auditorName: string;
  companyCount: number;
  percentage: number;
}

export interface ClusterRequest {
  algorithm: string;
  k?: number;
}

export interface ClusterResponse {
  clusters: ClusterResult[];
}

export interface ClusterResult {
  id: number;
  centroid: unknown;
  companyCount: number;
  sampleCompanies: string[];
}

export interface AnomalyRequest {
  algorithm: string;
  threshold?: number;
}

export interface AnomalyResponse {
  anomalies: unknown[];
  totalScanned: number;
  threshold: number;
}

export interface RfmSegmentsResponse {
  segments: RfmSegment[];
}

export interface RfmSegment {
  name: string;
  count: number;
  description: string;
}

export interface CohortParams {
  groupBy?: string;
  metric?: string;
}

export interface CohortResponse {
  cohorts: CohortEntry[];
  groupBy: string;
  metric: string;
}

export interface CohortEntry {
  group: string;
  count: number;
  metric: string;
}

export interface CandidateParams {
  sortBy?: string;
  canton?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditCandidate {
  uid: string;
  name: string;
  canton?: string;
  legalForm?: string;
  shareCapital?: number;
  auditorName?: string;
  auditorCategory?: string;
}

// --- Dossiers ---

export interface CreateDossierRequest {
  uid: string;
  level?: string;
}

export interface Dossier {
  id: string;
  userId: string;
  companyUid: string;
  companyName: string;
  level: string;
  content: string;
  sources: string[];
  createdAt: string;
}

export interface DossierSummary {
  id: string;
  companyUid: string;
  companyName: string;
  level: string;
  createdAt: string;
}

// --- Graph ---

export interface GraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphNode {
  id: string;
  name: string;
  uid: string;
  nodeType: string;
  capital?: number;
  canton?: string;
  status?: string;
  role?: string;
  personId?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  linkType: string;
  label: string;
}

export interface NetworkAnalysisRequest {
  uids: string[];
  overlay: string;
}

export interface NetworkAnalysisResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  clusters: NetworkCluster[];
}

export interface NetworkCluster {
  id: number;
  companyUids: string[];
  sharedPersons: string[];
}

// ===========================================================================
// v3.1+ surface
// ===========================================================================

// --- Timeline ---

export interface TimelineParams {
  since?: string;
  until?: string;
  changeType?: string;
}

export interface TimelineEvent {
  id: string;
  category: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  summary?: string;
  source?: string;
  severity?: string;
  date: string;
}

export interface TimelineResponse {
  uid: string;
  companyName: string;
  events: TimelineEvent[];
  totalEvents: number;
}

export interface TimelineSummaryResponse {
  uid: string;
  companyName: string;
  summary: string;
  eventCount: number;
  generatedAt: string;
}

// --- Similar companies ---

export interface SimilarParams {
  limit?: number;
}

export interface SimilarCompanyResult {
  uid: string;
  name: string;
  canton?: string;
  industry?: string;
  legalForm?: string;
  shareCapital?: number;
  status?: string;
  similarityScore: number;
  matchingDimensions: string[];
}

export interface SimilarCompaniesResponse {
  companyUid: string;
  companyName: string;
  results: SimilarCompanyResult[];
}

// --- UBO / Ownership ---
//
// Non-Swiss parent entities resolved via GLEIF appear with synthetic
// identifiers of the form `LEI:<20-char-lei>` in the *Uid fields below.
// These are NOT resolvable via `companies.get()`.

export interface UboPerson {
  personId: number;
  name: string;
  controllingEntityUid: string;
  controllingEntityName: string;
  role: string;
  signingAuthority?: string;
  pathLength: number;
}

export interface ChainLink {
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  depth: number;
}

export interface UboResponse {
  uid: string;
  companyName: string;
  uboPersons: UboPerson[];
  ownershipChain: ChainLink[];
  chainDepth: number;
  riskFlags: string[];
  /** Human-readable explanation when the chain can't be fully resolved. */
  dataCoverageNote?: string;
}

export interface OwnershipRequest {
  maxDepth?: number;
}

export interface OwnershipEntity {
  uid: string;
  name: string;
  canton?: string;
  status?: string;
  legalForm?: string;
  shareCapital?: number;
}

export interface OwnershipLink {
  sourceUid: string;
  sourceName: string;
  targetUid: string;
  targetName: string;
  /** `head_office` | `branch_office` | `acquisition` | `gleif_parent`. */
  relationshipType: string;
  depth: number;
}

export interface PersonCompanyRole {
  companyUid: string;
  companyName: string;
  role: string;
}

export interface KeyPerson {
  name: string;
  companies: PersonCompanyRole[];
}

export interface CircularFlag {
  loopUids: string[];
  description: string;
}

export interface OwnershipResponse {
  uid: string;
  companyName: string;
  ownershipChain: OwnershipLink[];
  ultimateParent?: OwnershipEntity;
  keyPersons: KeyPerson[];
  circularFlags: CircularFlag[];
  riskLevel: string;
  assessedAt: string;
}

// --- Media ---

export interface MediaParams {
  /** `positive` | `neutral` | `negative`. */
  sentiment?: string;
  since?: string;
  limit?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  publishedAt?: string;
  url?: string;
  sentimentScore?: number;
  sentimentLabel?: string;
  topics?: string[];
  riskRelevance?: number;
}

export interface MediaResponse {
  items: MediaItem[];
  total: number;
}

export interface MediaAnalysisResponse {
  analyzedCount: number;
  message: string;
}

// --- Alerts ---

export interface Alert {
  id: string;
  name: string;
  queryParams: unknown;
  webhookUrl?: string;
  frequency: string;
  isActive: boolean;
  savedSearchId?: string;
  lastTriggeredAt?: string;
  lastResultCount?: number;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertRequest {
  name: string;
  queryParams: unknown;
  webhookUrl?: string;
  /** `hourly` | `daily` | `weekly`. Defaults to `daily` on the server. */
  frequency?: string;
  savedSearchId?: string;
}

// --- Analytics: flows, migrations, benchmark ---

export interface FlowsParams {
  /** `monthly` (default) | `quarterly` | `yearly`. */
  period?: string;
  since?: string;
  /** `canton` (default) | `industry` | `legalForm`. */
  groupBy?: string;
}

export interface FlowDataPoint {
  period: string;
  group: string;
  registrations: number;
  dissolutions: number;
  net: number;
}

export interface FlowsResponse {
  flows: FlowDataPoint[];
  /** Surfaces asymmetric-accuracy notes (e.g. historical dissolution under-counting). */
  dataCoverageNote?: string;
}

export interface MigrationsParams {
  since?: string;
}

export interface MigrationFlow {
  fromCanton: string;
  toCanton: string;
  count: number;
}

export interface MigrationResponse {
  flows: MigrationFlow[];
  topFlows: MigrationFlow[];
}

export interface BenchmarkParams {
  /** Comma-separated dimensions (e.g. `"capital,board_size"`). Omit for all. */
  dimensions?: string;
}

export interface BenchmarkDimension {
  name: string;
  companyValue: number;
  industryMedian: number;
  percentile: number;
}

export interface BenchmarkResponse {
  uid: string;
  companyName: string;
  industry?: string;
  peerCount: number;
  dimensions: BenchmarkDimension[];
}

// --- Batch screening ---

export interface BatchScreeningRequest {
  /** Up to 100 UIDs per call. */
  uids: string[];
}

export interface BatchScreeningHitSummary {
  source: string;
  matchedName: string;
  score: number;
}

export interface BatchScreeningResultByUid {
  uid: string;
  companyName: string;
  riskLevel: string;
  totalHits: number;
  sourcesChecked: string[];
  hits: BatchScreeningHitSummary[];
}

export interface BatchScreeningResponse {
  results: BatchScreeningResultByUid[];
}

// --- Batch risk score ---

export interface BatchRiskScoreRequest {
  /** Up to 50 UIDs per call. */
  uids: string[];
}

export interface RiskScoreResult {
  uid: string;
  companyName: string;
  overallScore: number;
  riskLevel: string;
}

export interface BatchRiskScoreResponse {
  results: RiskScoreResult[];
}

// --- Person network ---

export interface NetworkPerson {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
}

export interface NetworkCompany {
  uid: string;
  name?: string;
  role: string;
  roleCategory: string;
  isCurrent?: boolean;
  since?: string;
  until?: string;
  // Enrichment provenance (v3.1+)
  roleSource?: string;
  roleConfidence?: number;
  roleInferredAt?: string;
}

export interface CoDirectorCompany {
  uid: string;
  name?: string;
}

export interface CoDirector {
  personId: string;
  name: string;
  sharedCompanies: number;
  companies: CoDirectorCompany[];
}

export interface NetworkStats {
  totalCompanies: number;
  activeRoles: number;
  coDirectorCount: number;
}

export interface PersonNetworkResponse {
  person: NetworkPerson;
  companies: NetworkCompany[];
  coDirectors: CoDirector[];
  stats: NetworkStats;
}
