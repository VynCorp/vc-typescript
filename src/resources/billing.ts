import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { SessionUrl } from "../types.js";

export class Billing {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async createCheckout(tier: string): Promise<VyncoResponse<SessionUrl>> {
    return this.#client._requestWithBody("POST", "/v1/billing/checkout-session", { tier });
  }

  async createPortal(): Promise<VyncoResponse<SessionUrl>> {
    return this.#client._requestWithBody("POST", "/v1/billing/portal-session", {});
  }
}
