import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AnomalyRequest,
  AnomalyResponse,
  AuditCandidate,
  AuditorMarketShare,
  BenchmarkParams,
  BenchmarkResponse,
  CandidateParams,
  CantonDistribution,
  ClusterRequest,
  ClusterResponse,
  CohortParams,
  CohortResponse,
  FlowsParams,
  FlowsResponse,
  MigrationResponse,
  MigrationsParams,
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

  async candidates(
    params?: CandidateParams,
  ): Promise<VyncoResponse<PagedResponse<AuditCandidate>>> {
    if (!params) return this.#client._request("GET", "/v1/analytics/candidates");
    const queryParams: Record<string, string> = {};
    if (params.sortBy != null) queryParams.sortBy = params.sortBy;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/analytics/candidates", queryParams);
  }

  /**
   * Market flow analytics — registrations and dissolutions over time.
   *
   * `params.period`: `monthly` (default), `quarterly`, `yearly`.
   * `params.groupBy`: `canton` (default), `industry`, `legalForm`.
   */
  async flows(params?: FlowsParams): Promise<VyncoResponse<FlowsResponse>> {
    if (!params) return this.#client._request("GET", "/v1/analytics/flows");
    const queryParams: Record<string, string> = {};
    if (params.period != null) queryParams.period = params.period;
    if (params.since != null) queryParams.since = params.since;
    if (params.groupBy != null) queryParams.groupBy = params.groupBy;
    if (Object.keys(queryParams).length === 0) {
      return this.#client._request("GET", "/v1/analytics/flows");
    }
    return this.#client._requestWithParams("GET", "/v1/analytics/flows", queryParams);
  }

  /** Canton migration analytics — companies moving their legal seat. */
  async migrations(params?: MigrationsParams): Promise<VyncoResponse<MigrationResponse>> {
    if (!params || params.since == null) {
      return this.#client._request("GET", "/v1/analytics/migrations");
    }
    return this.#client._requestWithParams("GET", "/v1/analytics/migrations", {
      since: params.since,
    });
  }

  /**
   * Benchmark a company against its industry peers.
   *
   * Returns percentile ranks for dimensions such as capital, board_size,
   * change_frequency, and company_age.
   */
  async benchmark(
    uid: string,
    params?: BenchmarkParams,
  ): Promise<VyncoResponse<BenchmarkResponse>> {
    const queryParams: Record<string, string> = { uid };
    if (params?.dimensions != null) queryParams.dimensions = params.dimensions;
    return this.#client._requestWithParams("GET", "/v1/analytics/benchmark", queryParams);
  }
}
