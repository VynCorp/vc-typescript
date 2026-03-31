import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  CreateWebhookRequest,
  CreateWebhookResponse,
  TestDeliveryResponse,
  UpdateWebhookRequest,
  WebhookDelivery,
  WebhookSubscription,
} from "../types.js";

export class Webhooks {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(): Promise<VyncoResponse<WebhookSubscription[]>> {
    return this.#client._request("GET", "/v1/webhooks");
  }

  async create(request: CreateWebhookRequest): Promise<VyncoResponse<CreateWebhookResponse>> {
    return this.#client._requestWithBody("POST", "/v1/webhooks", request);
  }

  async update(
    id: string,
    request: UpdateWebhookRequest,
  ): Promise<VyncoResponse<WebhookSubscription>> {
    return this.#client._requestWithBody(
      "PUT",
      `/v1/webhooks/${encodeURIComponent(id)}`,
      request,
    );
  }

  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/webhooks/${encodeURIComponent(id)}`,
    );
  }

  async test(id: string): Promise<VyncoResponse<TestDeliveryResponse>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/webhooks/${encodeURIComponent(id)}/test`,
      {},
    );
  }

  async deliveries(id: string, limit?: number): Promise<VyncoResponse<WebhookDelivery[]>> {
    const path = `/v1/webhooks/${encodeURIComponent(id)}/deliveries`;
    if (limit != null) {
      return this.#client._requestWithParams("GET", path, { limit: String(limit) });
    }
    return this.#client._request("GET", path);
  }
}
