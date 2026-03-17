import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { SyncStatus } from "../types.js";

export class Sync {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async status(): Promise<VyncoResponse<SyncStatus>> {
    return this.#client._request("GET", "/sync/status");
  }
}
