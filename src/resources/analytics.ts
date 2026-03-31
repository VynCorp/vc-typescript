import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AnomalyRequest,
  AnomalyResponse,
  AuditCandidate,
  AuditCandidateParams,
  AuditorMarketShare,
  CantonDistribution,
  ClusterRequest,
  ClusterResponse,
  CohortParams,
  CohortResponse,
  CompanyStatistics,
  PagedResponse,
  RfmSegmentsResponse,
} from "../types.js";

export class Analytics {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async cantons(): Promise<VyncoResponse<CantonDistribution[]>> {
    return this.#client._request("GET", "/v1/analytics/cantons");
  }

  async auditors(): Promise<VyncoResponse<AuditorMarketShare[]>> {
    return this.#client._request("GET", "/v1/analytics/auditors");
  }

  async cluster(request: ClusterRequest): Promise<VyncoResponse<ClusterResponse>> {
    return this.#client._requestWithBody("POST", "/v1/analytics/cluster", request);
  }

  async anomalies(request: AnomalyRequest): Promise<VyncoResponse<AnomalyResponse>> {
    return this.#client._requestWithBody("POST", "/v1/analytics/anomalies", request);
  }

  async rfmSegments(): Promise<VyncoResponse<RfmSegmentsResponse>> {
    return this.#client._request("GET", "/v1/analytics/rfm-segments");
  }

  async cohorts(params?: CohortParams): Promise<VyncoResponse<CohortResponse>> {
    if (!params) return this.#client._request("GET", "/v1/analytics/cohorts");
    const queryParams: Record<string, string> = {};
    if (params.groupBy != null) queryParams.groupBy = params.groupBy;
    if (params.metric != null) queryParams.metric = params.metric;
    return this.#client._requestWithParams("GET", "/v1/analytics/cohorts", queryParams);
  }

  async statistics(): Promise<VyncoResponse<CompanyStatistics>> {
    return this.#client._request("GET", "/v1/analytics/statistics");
  }

  async candidates(
    params?: AuditCandidateParams,
  ): Promise<VyncoResponse<PagedResponse<AuditCandidate>>> {
    if (!params) return this.#client._request("GET", "/v1/analytics/candidates");
    const queryParams: Record<string, string> = {};
    if (params.sortBy != null) queryParams.sortBy = params.sortBy;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/analytics/candidates", queryParams);
  }
}
