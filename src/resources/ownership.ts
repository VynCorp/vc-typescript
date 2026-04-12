import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { OwnershipRequest, OwnershipResponse } from "../types.js";

/**
 * Ownership trace operations.
 *
 * For ultimate beneficial owner resolution use `companies.ubo(uid)` —
 * this resource exposes the lower-level ownership-chain trace endpoint
 * that walks head-office / branch-office / acquisition relationships
 * upward and detects circular ownership.
 */
export class Ownership {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /**
   * Trace the ownership chain upward from a company.
   *
   * Walks head-office / branch-office relationships up to `maxDepth`
   * levels (default 10 on the server, max 20), detecting circular
   * ownership and identifying key persons.
   */
  async trace(
    uid: string,
    request: OwnershipRequest = {},
  ): Promise<VyncoResponse<OwnershipResponse>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/ownership/${encodeURIComponent(uid)}`,
      request,
    );
  }
}
