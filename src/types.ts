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
  version?: string;
  uptime?: string;
}

// --- Companies ---

export interface Company {
  uid: string;
  name: string;
  canton?: string;
  status?: string;
  legalForm?: string;
  shareCapital?: number;
  industry?: string;
  auditorCategory?: string;
  updatedAt?: string;
}

export interface CompanyListParams {
  search?: string;
  canton?: string;
  changedSince?: string;
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

export interface CompanyEvent {
  id: string;
  ceType: string;
  ceSource: string;
  ceTime: string;
  companyUid: string;
  companyName?: string;
  category?: string;
  severity?: string;
  summary?: string;
  detailJson?: string;
  createdAt: string;
}

export interface EventListResponse {
  events: CompanyEvent[];
  count: number;
}

export interface CompareRequest {
  uids: string[];
}

export interface CompareResponse {
  companies: Company[];
  dimensions: string[];
  similarities: string[];
  differences: string[];
}

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
  publicationDate?: string;
}

export interface Relationship {
  relatedUid: string;
  relatedName: string;
  relationshipType: string;
  sharedPersons: number;
}

export interface HierarchyResponse {
  parent?: Company;
  subsidiaries: Company[];
  siblings: Company[];
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

// --- Auditors ---

export interface AuditorHistoryResponse {
  companyUid: string;
  companyName: string;
  currentAuditor?: string;
  history: AuditorTenure[];
}

export interface AuditorTenure {
  id: string;
  companyUid: string;
  auditorName: string;
  appointedAt?: string;
  resignedAt?: string;
  tenureYears?: number;
  isCurrent: boolean;
  source?: string;
}

export interface AuditorTenureParams {
  minYears?: number;
  canton?: string;
  page?: number;
  pageSize?: number;
}

// --- Dashboard ---

export interface DashboardResponse {
  [key: string]: unknown;
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
  entityType?: string;
  score: number;
  datasets: string[];
  details?: Record<string, unknown>;
}

// --- Watchlists ---

export interface WatchlistSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  companyCount: number;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  companyCount: number;
}

export interface CreateWatchlistRequest {
  name: string;
  description?: string;
}

export interface AddCompaniesRequest {
  uids: string[];
}

export interface AddCompaniesResponse {
  added: number;
  alreadyPresent: number;
}

export interface WatchlistCompaniesResponse {
  companies: Company[];
  total: number;
}

// --- Webhooks ---

export interface WebhookSubscription {
  id: string;
  url: string;
  description?: string;
  eventFilters?: string[];
  companyFilters?: string[];
  status: string;
  createdAt: string;
  updatedAt?: string;
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
  id: string;
  url: string;
  description?: string;
  eventFilters?: string[];
  companyFilters?: string[];
  status: string;
  signingSecret: string;
  createdAt: string;
}

export interface TestDeliveryResponse {
  success: boolean;
  httpStatus?: number;
  errorMessage?: string;
  deliveredAt: string;
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
  format?: string;
  totalRows?: number;
  fileSizeBytes?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface ExportDownload {
  job: ExportJob;
  data?: unknown;
}

export interface ExportFile {
  bytes: ArrayBuffer;
  contentType?: string;
  filename?: string;
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
  filtersApplied: Record<string, unknown>;
  results: Company[];
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
  name?: string;
  environment?: string;
  scopes?: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiKeyCreated {
  id: string;
  name?: string;
  key: string;
  environment?: string;
  scopes?: string[];
  createdAt: string;
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
  overageRate?: number;
}

export interface CreditUsage {
  operations: UsageRow[];
  total: number;
  period: string;
}

export interface UsageRow {
  operation: string;
  credits: number;
}

export interface CreditHistory {
  items: CreditLedgerEntry[];
  total: number;
}

export interface CreditLedgerEntry {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description?: string;
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
  slug?: string;
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
}

export interface CreateTeamRequest {
  name?: string;
}

export interface TeamMember {
  id: string;
  name?: string;
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
  email: string;
  role: string;
  createdAt: string;
}

export interface BillingSummary {
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
  usedThisMonth: number;
  members: number;
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
  type?: string;
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
  byType: Record<string, number>;
}

// --- Persons ---

export interface BoardMember {
  id?: string;
  name: string;
  role?: string;
  nationality?: string;
  placeOfOrigin?: string;
  signatureAuthority?: string;
  since?: string;
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
  companyCount: number;
  centroid?: Record<string, number>;
  topCompanies?: Array<{ uid: string; name: string; score: number }>;
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
  segment: string;
  count: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
}

export interface CohortResponse {
  cohorts: unknown[];
  groupBy: string;
  metric: string;
}

export interface CohortParams {
  groupBy?: string;
  metric?: string;
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

export interface AuditCandidateParams {
  sortBy?: string;
  canton?: string;
  page?: number;
  pageSize?: number;
}

// --- Dossiers ---

export interface CreateDossierRequest {
  uid: string;
  level?: string;
}

export interface Dossier {
  id: string;
  userId?: string;
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
  uid?: string;
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
  label?: string;
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
  nodeIds: string[];
  density?: number;
}
