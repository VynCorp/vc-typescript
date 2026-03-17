import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AnomalyRequest,
  AnomalyResult,
  ClusterRequest,
  ClusterResult,
  CohortResult,
} from "../types.js";

export class Analytics {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async companies(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/analytics/companies");
  }

  async cantons(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/analytics/cantons");
  }

  async auditors(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/analytics/auditors");
  }

  async cluster(request: ClusterRequest): Promise<VyncoResponse<ClusterResult>> {
    return this.#client._requestWithBody("POST", "/analytics/cluster", request);
  }

  async anomalies(request: AnomalyRequest): Promise<VyncoResponse<AnomalyResult>> {
    return this.#client._requestWithBody("POST", "/analytics/anomalies", request);
  }

  async rfmSegments(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/analytics/segments/rfm");
  }

  async cohorts(params?: Record<string, string>): Promise<VyncoResponse<CohortResult>> {
    if (params && Object.keys(params).length > 0) {
      return this.#client._requestWithParams("GET", "/analytics/cohorts", params);
    }
    return this.#client._request("GET", "/analytics/cohorts");
  }

  async crossTabulation(
    params?: Record<string, string>,
  ): Promise<VyncoResponse<unknown>> {
    if (params && Object.keys(params).length > 0) {
      return this.#client._requestWithParams("GET", "/analytics/cross", params);
    }
    return this.#client._request("GET", "/analytics/cross");
  }
}
