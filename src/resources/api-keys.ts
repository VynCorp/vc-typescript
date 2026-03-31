import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type { ApiKey, ApiKeyCreated, CreateApiKeyRequest } from "../types.js";

export class ApiKeys {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(): Promise<VyncoResponse<ApiKey[]>> {
    return this.#client._request("GET", "/v1/api-keys");
  }

  async create(request: CreateApiKeyRequest): Promise<VyncoResponse<ApiKeyCreated>> {
    return this.#client._requestWithBody("POST", "/v1/api-keys", request);
  }

  async revoke(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty("DELETE", `/v1/api-keys/${encodeURIComponent(id)}`);
  }
}
