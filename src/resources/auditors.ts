import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AuditorHistoryResponse,
  AuditorTenure,
  AuditorTenureParams,
  PagedResponse,
} from "../types.js";

export class Auditors {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async history(uid: string): Promise<VyncoResponse<AuditorHistoryResponse>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/auditor-history`,
    );
  }

  async tenures(
    params?: AuditorTenureParams,
  ): Promise<VyncoResponse<PagedResponse<AuditorTenure>>> {
    if (!params) return this.#client._request("GET", "/v1/auditor-tenures");
    const queryParams: Record<string, string> = {};
    if (params.minYears != null) queryParams.min_years = String(params.minYears);
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/auditor-tenures", queryParams);
  }
}
