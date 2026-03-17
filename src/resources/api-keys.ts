import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type { ApiKeyCreated, ApiKeyInfo, CreateApiKeyRequest } from "../types.js";

export class ApiKeys {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(): Promise<VyncoResponse<ApiKeyInfo[]>> {
    return this.#client._request("GET", "/api-keys");
  }

  async create(request: CreateApiKeyRequest): Promise<VyncoResponse<ApiKeyCreated>> {
    return this.#client._requestWithBody("POST", "/api-keys", request);
  }

  async revoke(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty("DELETE", `/api-keys/${encodeURIComponent(id)}`);
  }
}
