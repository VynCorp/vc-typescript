import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { HealthResponse } from "../types.js";

export class Health {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async check(): Promise<VyncoResponse<HealthResponse>> {
    return this.#client._request("GET", "/health");
  }
}
