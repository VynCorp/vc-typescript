import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  BatchScreeningRequest,
  BatchScreeningResponse,
  SanctionsListResponse,
  SanctionsSearchParams,
  ScreeningRequest,
  ScreeningResponse,
} from "../types.js";

export class Screening {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async screen(request: ScreeningRequest): Promise<VyncoResponse<ScreeningResponse>> {
    return this.#client._requestWithBody("POST", "/v1/screening", request);
  }

  /** Screen up to 100 companies against sanctions lists in a single call. */
  async batch(request: BatchScreeningRequest): Promise<VyncoResponse<BatchScreeningResponse>> {
    return this.#client._requestWithBody("POST", "/v1/screening/batch", request);
  }

  /** Browse SECO/OpenSanctions/FINMA sanctions databases with search and pagination. */
  async browseSanctions(
    params?: SanctionsSearchParams,
  ): Promise<VyncoResponse<SanctionsListResponse>> {
    if (!params) return this.#client._request("GET", "/v1/sanctions");
    const queryParams: Record<string, string> = {};
    if (params.search != null) queryParams.search = params.search;
    if (params.entityType != null) queryParams.entityType = params.entityType;
    if (params.program != null) queryParams.program = params.program;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    if (Object.keys(queryParams).length === 0) return this.#client._request("GET", "/v1/sanctions");
    return this.#client._requestWithParams("GET", "/v1/sanctions", queryParams);
  }
}
