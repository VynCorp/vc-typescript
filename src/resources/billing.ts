import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { CheckoutSessionResponse, PortalSessionResponse } from "../types.js";

export class Billing {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async createCheckout(tier: string): Promise<VyncoResponse<CheckoutSessionResponse>> {
    return this.#client._requestWithBody("POST", "/billing/checkout", { tier });
  }

  async createPortal(): Promise<VyncoResponse<PortalSessionResponse>> {
    return this.#client._requestWithBody("POST", "/billing/portal", {});
  }
}
