import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
  Webhook,
  WebhookCreated,
} from "../types.js";

export class Webhooks {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(): Promise<VyncoResponse<Webhook[]>> {
    return this.#client._request("GET", "/webhooks");
  }

  async create(request: CreateWebhookRequest): Promise<VyncoResponse<WebhookCreated>> {
    return this.#client._requestWithBody("POST", "/webhooks", request);
  }

  async get(id: string): Promise<VyncoResponse<Webhook>> {
    return this.#client._request("GET", `/webhooks/${encodeURIComponent(id)}`);
  }

  async update(
    id: string,
    request: UpdateWebhookRequest,
  ): Promise<VyncoResponse<Webhook>> {
    return this.#client._requestWithBody(
      "PUT",
      `/webhooks/${encodeURIComponent(id)}`,
      request,
    );
  }

  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/webhooks/${encodeURIComponent(id)}`,
    );
  }

  async test(id: string): Promise<VyncoResponse<unknown>> {
    return this.#client._requestWithBody(
      "POST",
      `/webhooks/${encodeURIComponent(id)}/test`,
      {},
    );
  }
}
