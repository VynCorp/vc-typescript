import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  BatchScreeningRequest,
  BatchScreeningResponse,
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
}
