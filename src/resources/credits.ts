import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { CreditBalance, UsageBreakdown } from "../types.js";

export class Credits {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async balance(): Promise<VyncoResponse<CreditBalance>> {
    return this.#client._request("GET", "/credits/balance");
  }

  async usage(since?: string): Promise<VyncoResponse<UsageBreakdown>> {
    if (since) {
      return this.#client._requestWithParams("GET", "/credits/usage", { since });
    }
    return this.#client._request("GET", "/credits/usage");
  }

  async history(limit?: number, offset?: number): Promise<VyncoResponse<unknown>> {
    const params: Record<string, string> = {};
    if (limit != null) params.limit = String(limit);
    if (offset != null) params.offset = String(offset);
    if (Object.keys(params).length > 0) {
      return this.#client._requestWithParams("GET", "/credits/history", params);
    }
    return this.#client._request("GET", "/credits/history");
  }
}
