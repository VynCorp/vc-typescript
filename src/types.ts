// --- Pagination ---

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Companies ---

export interface Company {
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

export interface CompanySearchParams {
  search?: string;
  canton?: string;
  legalForm?: string;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CompanyChange {
  id: string;
  companyUid: string;
  changeType: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  detectedAt: string;
  sourceDate?: string;
}

export interface PersonRole {
  personId: string;
  firstName: string;
  lastName: string;
  role: string;
  since?: string;
  until?: string;
}

export interface CompanyCount {
  count: number;
}

export interface CompanyRelationship {
  id: string;
  sourceCompanyUid: string;
  targetCompanyUid: string;
  relationshipType: string;
  sourceLei?: string;
  targetLei?: string;
  dataSource: string;
  isActive: boolean;
}

export interface CompanyComparison {
  companies: Company[];
  dimensions: string[];
  similarities: string[];
  differences: string[];
}

// --- Persons ---

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  roles: PersonRole[];
}

export interface PersonSearchParams {
  name: string;
}

// --- Dossiers ---

export interface Dossier {
  id: string;
  companyUid: string;
  status: string;
  executiveSummary?: string;
  keyInsights?: string[];
  riskFactors?: string[];
  generatedAt?: string;
}

export interface GenerateDossierRequest {
  level: "summary" | "standard" | "comprehensive" | (string & {});
}

// --- Credits & Billing ---

export interface CreditBalance {
  balance: number;
  monthlyCredits: number;
  usedThisMonth: number;
  tier: string;
  overageRate: number;
}

export interface UsageBreakdown {
  operations: UsageOperation[];
  totalDebited: number;
  period?: UsagePeriod;
}

export interface UsageOperation {
  operation: string;
  count: number;
  credits: number;
}

export interface UsagePeriod {
  start: string;
  end: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

// --- API Keys ---

export interface ApiKeyInfo {
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

export interface ApiKeyCreated {
  id: string;
  name: string;
  rawKey: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  isTest: boolean;
  permissions: string[];
}

// --- Webhooks ---

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  secret?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebhookCreated {
  id: string;
  url: string;
  events: string[];
  secret: string;
  createdAt?: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  status?: string;
}

// --- Teams ---

export interface Team {
  id: string;
  name: string;
  slug: string;
  tier: string;
  creditBalance: number;
  monthlyCredits: number;
  overageRate: number;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  slug: string;
}

// --- Users ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  creditBalance: number;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// --- Analytics ---

export interface ClusterRequest {
  algorithm?: string;
  k?: number;
  features?: string[];
}

export interface ClusterResult {
  algorithm: string;
  k: number;
  clusters: ClusterGroup[];
  metrics: Record<string, number>;
}

export interface ClusterGroup {
  id: number;
  size: number;
  centroid: Record<string, number>;
  companies: string[];
}

export interface AnomalyRequest {
  algorithm?: string;
  threshold?: number;
}

export interface AnomalyResult {
  algorithm: string;
  anomalies: AnomalyEntry[];
  normalCount: number;
  anomalyCount: number;
  anomalyRate: number;
}

export interface AnomalyEntry {
  companyUid: string;
  score: number;
  factors: string[];
}

export interface CohortResult {
  groupBy: string;
  metric: string;
  cohorts: CohortGroup[];
}

export interface CohortGroup {
  label: string;
  count: number;
  value: number;
}

// --- Sync ---

export interface SyncStatus {
  lastSync: string;
  status: string;
  recordsProcessed?: number;
  errors?: number;
}
