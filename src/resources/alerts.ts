import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type { Alert, CreateAlertRequest } from "../types.js";

/**
 * Saved alerts — persistent saved queries that trigger notifications
 * (optionally via webhook) when matching companies or events appear.
 */
export class Alerts {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /** List all alerts for the authenticated user. */
  async list(): Promise<VyncoResponse<Alert[]>> {
    return this.#client._request("GET", "/v1/alerts");
  }

  /**
   * Create a new alert.
   *
   * `frequency` accepts `hourly`, `daily`, or `weekly` (default `daily`
   * on the server). `queryParams` is an arbitrary JSON filter.
   */
  async create(request: CreateAlertRequest): Promise<VyncoResponse<Alert>> {
    return this.#client._requestWithBody("POST", "/v1/alerts", request);
  }

  /** Delete an alert. */
  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/alerts/${encodeURIComponent(id)}`,
    );
  }
}
