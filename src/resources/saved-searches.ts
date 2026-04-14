import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  CreateSavedSearchRequest,
  SavedSearch,
  UpdateSavedSearchRequest,
} from "../types.js";

export class SavedSearches {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /** List all saved searches. */
  async list(): Promise<VyncoResponse<SavedSearch[]>> {
    return this.#client._request("GET", "/v1/saved-searches");
  }

  /** Create a new saved search. */
  async create(request: CreateSavedSearchRequest): Promise<VyncoResponse<SavedSearch>> {
    return this.#client._requestWithBody("POST", "/v1/saved-searches", request);
  }

  /** Get a saved search by ID. */
  async get(id: string): Promise<VyncoResponse<SavedSearch>> {
    return this.#client._request(
      "GET",
      `/v1/saved-searches/${encodeURIComponent(id)}`,
    );
  }

  /** Update a saved search. */
  async update(
    id: string,
    request: UpdateSavedSearchRequest,
  ): Promise<VyncoResponse<SavedSearch>> {
    return this.#client._requestWithBody(
      "PUT",
      `/v1/saved-searches/${encodeURIComponent(id)}`,
      request,
    );
  }

  /** Delete a saved search. */
  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/saved-searches/${encodeURIComponent(id)}`,
    );
  }
}
