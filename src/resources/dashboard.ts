import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { DashboardResponse } from "../types.js";

export class Dashboard {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async get(): Promise<VyncoResponse<DashboardResponse>> {
    return this.#client._request("GET", "/v1/dashboard");
  }
}
