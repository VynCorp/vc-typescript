import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";

export class Settings {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async getPreferences(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/settings/preferences");
  }

  async updatePreferences(prefs: unknown): Promise<VyncoResponse<unknown>> {
    return this.#client._requestWithBody("PUT", "/settings/preferences", prefs);
  }

  async getNotifications(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/settings/notifications");
  }

  async updateNotifications(prefs: unknown): Promise<VyncoResponse<unknown>> {
    return this.#client._requestWithBody("PUT", "/settings/notifications", prefs);
  }
}
