import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { CreditBalance, CreditHistory, CreditUsage } from "../types.js";

export class Credits {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async balance(): Promise<VyncoResponse<CreditBalance>> {
    return this.#client._request("GET", "/v1/credits/balance");
  }

  async usage(since?: string): Promise<VyncoResponse<CreditUsage>> {
    if (since) {
      return this.#client._requestWithParams("GET", "/v1/credits/usage", { since });
    }
    return this.#client._request("GET", "/v1/credits/usage");
  }

  async history(limit?: number, offset?: number): Promise<VyncoResponse<CreditHistory>> {
    const params: Record<string, string> = {};
    if (limit != null) params.limit = String(limit);
    if (offset != null) params.offset = String(offset);
    if (Object.keys(params).length > 0) {
      return this.#client._requestWithParams("GET", "/v1/credits/history", params);
    }
    return this.#client._request("GET", "/v1/credits/history");
  }
}
