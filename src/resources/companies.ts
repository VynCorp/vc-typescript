import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  Company,
  CompanyCount,
  CompanyListParams,
  CompanyReport,
  CompanyStatistics,
  CompareRequest,
  CompareResponse,
  EventListResponse,
  Fingerprint,
  HierarchyResponse,
  NearbyCompany,
  NearbyParams,
  NewsItem,
  PagedResponse,
  Relationship,
} from "../types.js";

export class Companies {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(
    params?: CompanyListParams,
  ): Promise<VyncoResponse<PagedResponse<Company>>> {
    if (!params) return this.#client._request("GET", "/v1/companies");
    const queryParams: Record<string, string> = {};
    if (params.search != null) queryParams.search = params.search;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.changedSince != null) queryParams.changed_since = params.changedSince;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.page_size = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/companies", queryParams);
  }

  async get(uid: string): Promise<VyncoResponse<Company>> {
    return this.#client._request("GET", `/v1/companies/${encodeURIComponent(uid)}`);
  }

  async count(): Promise<VyncoResponse<CompanyCount>> {
    return this.#client._request("GET", "/v1/companies/count");
  }

  async events(uid: string, limit?: number): Promise<VyncoResponse<EventListResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/events`;
    if (limit != null) {
      return this.#client._requestWithParams("GET", path, { limit: String(limit) });
    }
    return this.#client._request("GET", path);
  }

  async statistics(): Promise<VyncoResponse<CompanyStatistics>> {
    return this.#client._request("GET", "/v1/companies/statistics");
  }

  async compare(request: CompareRequest): Promise<VyncoResponse<CompareResponse>> {
    return this.#client._requestWithBody("POST", "/v1/companies/compare", request);
  }

  async news(uid: string): Promise<VyncoResponse<NewsItem[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/news`,
    );
  }

  async reports(uid: string): Promise<VyncoResponse<CompanyReport[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/reports`,
    );
  }

  async relationships(uid: string): Promise<VyncoResponse<Relationship[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/relationships`,
    );
  }

  async hierarchy(uid: string): Promise<VyncoResponse<HierarchyResponse>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/hierarchy`,
    );
  }

  async fingerprint(uid: string): Promise<VyncoResponse<Fingerprint>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/fingerprint`,
    );
  }

  async nearby(params: NearbyParams): Promise<VyncoResponse<NearbyCompany[]>> {
    const queryParams: Record<string, string> = {
      lat: String(params.lat),
      lng: String(params.lng),
    };
    if (params.radiusKm != null) queryParams.radiusKm = String(params.radiusKm);
    if (params.limit != null) queryParams.limit = String(params.limit);
    return this.#client._requestWithParams("GET", "/v1/companies/nearby", queryParams);
  }
}
