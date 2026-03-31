import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  ChangeListParams,
  ChangeStatistics,
  CompanyChange,
  PagedResponse,
} from "../types.js";

export class Changes {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(
    params?: ChangeListParams,
  ): Promise<VyncoResponse<PagedResponse<CompanyChange>>> {
    if (!params) return this.#client._request("GET", "/v1/changes");
    const queryParams: Record<string, string> = {};
    if (params.type != null) queryParams.type = params.type;
    if (params.since != null) queryParams.since = params.since;
    if (params.until != null) queryParams.until = params.until;
    if (params.companySearch != null) queryParams.companySearch = params.companySearch;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/changes", queryParams);
  }

  async byCompany(uid: string): Promise<VyncoResponse<CompanyChange[]>> {
    return this.#client._request("GET", `/v1/changes/${encodeURIComponent(uid)}`);
  }

  async statistics(): Promise<VyncoResponse<ChangeStatistics>> {
    return this.#client._request("GET", "/v1/changes/statistics");
  }
}
