// Client
export { VyncoClient, extractList } from "./client.js";
export type { VyncoClientOptions } from "./client.js";

// Response
export type { ResponseMeta, VyncoResponse } from "./response.js";

// Errors
export {
  VyncoError,
  AuthenticationError,
  InsufficientCreditsError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ServerError,
  NetworkError,
  DeserializeError,
  TimeoutError,
  ConfigError,
} from "./errors.js";
export type { ErrorBody } from "./errors.js";

// Resources
export {
  Ai,
  Alerts,
  Analytics,
  ApiKeys,
  Auditors,
  Billing,
  Changes,
  Companies,
  Credits,
  Dashboard,
  Dossiers,
  Exports,
  Graph,
  Health,
  Ownership,
  Persons,
  Screening,
  Teams,
  Watchlists,
  Webhooks,
} from "./resources/index.js";

// Types
export type {
  // Pagination
  PagedResponse,
  // Health
  HealthResponse,
  // Companies
  Company,
  CompanyListParams,
  CompanyCount,
  CompanyStatistics,
  CompanyFullResponse,
  PersonEntry,
  ChangeEntry,
  RelationshipEntry,
  CompanyEvent,
  EventListResponse,
  CompareRequest,
  CompareResponse,
  ComparisonDimension,
  NewsItem,
  CompanyReport,
  Relationship,
  HierarchyEntity,
  HierarchyResponse,
  Fingerprint,
  NearbyCompany,
  NearbyParams,
  // Classification
  Classification,
  // Corporate Structure
  CorporateStructure,
  RelatedCompanyEntry,
  // Acquisitions
  Acquisition,
  // Notes
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  // Tags
  Tag,
  CreateTagRequest,
  TagSummary,
  // Excel Export
  ExcelExportRequest,
  ExcelExportFilter,
  // Auditors
  AuditorHistoryResponse,
  AuditorTenure,
  AuditorTenureParams,
  // Dashboard
  DashboardResponse,
  DataCompleteness,
  PipelineStatus,
  AuditorTenureStats,
  LongestTenure,
  // Screening
  ScreeningRequest,
  ScreeningResponse,
  ScreeningHit,
  // Watchlists
  WatchlistSummary,
  Watchlist,
  CreateWatchlistRequest,
  AddCompaniesRequest,
  AddCompaniesResponse,
  WatchlistCompaniesResponse,
  WatchlistCompanyEntry,
  // Webhooks
  WebhookSubscription,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  CreateWebhookResponse,
  TestDeliveryResponse,
  WebhookDelivery,
  // Exports
  CreateExportRequest,
  ExportJob,
  ExportDownload,
  ExportFile,
  // AI
  AiDossierRequest,
  AiDossierResponse,
  AiSearchRequest,
  AiSearchResponse,
  RiskScoreRequest,
  RiskScoreResponse,
  RiskFactor,
  // API Keys
  ApiKey,
  ApiKeyCreated,
  CreateApiKeyRequest,
  // Credits
  CreditBalance,
  CreditUsage,
  UsagePeriod,
  UsageRow,
  CreditHistory,
  CreditLedgerEntry,
  // Billing
  SessionUrl,
  CheckoutRequest,
  // Teams
  Team,
  CreateTeamRequest,
  TeamMember,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  Invitation,
  JoinTeamRequest,
  JoinTeamResponse,
  BillingSummary,
  MemberUsage,
  // Changes
  CompanyChange,
  ChangeListParams,
  ChangeStatistics,
  // Persons
  BoardMember,
  BoardMemberParams,
  PersonSearchParams,
  PersonSearchResult,
  PersonDetail,
  PersonRoleDetail,
  // Person network (v3.1+)
  PersonNetworkResponse,
  NetworkPerson,
  NetworkCompany,
  NetworkStats,
  CoDirector,
  CoDirectorCompany,
  // Analytics
  CantonDistribution,
  AuditorMarketShare,
  ClusterRequest,
  ClusterResponse,
  ClusterResult,
  AnomalyRequest,
  AnomalyResponse,
  RfmSegmentsResponse,
  RfmSegment,
  CohortResponse,
  CohortEntry,
  CohortParams,
  CandidateParams,
  AuditCandidate,
  // Dossiers
  CreateDossierRequest,
  Dossier,
  DossierSummary,
  // Graph
  GraphResponse,
  GraphNode,
  GraphLink,
  NetworkAnalysisRequest,
  NetworkAnalysisResponse,
  NetworkCluster,
  // --- v3.1+ surface ---
  // Timeline
  TimelineParams,
  TimelineEvent,
  TimelineResponse,
  TimelineSummaryResponse,
  // Similar
  SimilarParams,
  SimilarCompanyResult,
  SimilarCompaniesResponse,
  // UBO / Ownership
  UboPerson,
  ChainLink,
  UboResponse,
  OwnershipRequest,
  OwnershipEntity,
  OwnershipLink,
  PersonCompanyRole,
  KeyPerson,
  CircularFlag,
  OwnershipResponse,
  // Media
  MediaParams,
  MediaItem,
  MediaResponse,
  MediaAnalysisResponse,
  // Alerts
  Alert,
  CreateAlertRequest,
  // Analytics extensions
  FlowsParams,
  FlowDataPoint,
  FlowsResponse,
  MigrationsParams,
  MigrationFlow,
  MigrationResponse,
  BenchmarkParams,
  BenchmarkDimension,
  BenchmarkResponse,
  // Batch screening
  BatchScreeningRequest,
  BatchScreeningHitSummary,
  BatchScreeningResultByUid,
  BatchScreeningResponse,
  // Batch risk score
  BatchRiskScoreRequest,
  RiskScoreResult,
  BatchRiskScoreResponse,
} from "./types.js";
