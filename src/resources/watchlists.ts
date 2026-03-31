import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  AddCompaniesRequest,
  AddCompaniesResponse,
  CreateWatchlistRequest,
  EventListResponse,
  Watchlist,
  WatchlistCompaniesResponse,
  WatchlistSummary,
} from "../types.js";

export class Watchlists {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(): Promise<VyncoResponse<WatchlistSummary[]>> {
    return this.#client._request("GET", "/v1/watchlists");
  }

  async create(request: CreateWatchlistRequest): Promise<VyncoResponse<Watchlist>> {
    return this.#client._requestWithBody("POST", "/v1/watchlists", request);
  }

  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/watchlists/${encodeURIComponent(id)}`,
    );
  }

  async companies(id: string): Promise<VyncoResponse<WatchlistCompaniesResponse>> {
    return this.#client._request(
      "GET",
      `/v1/watchlists/${encodeURIComponent(id)}/companies`,
    );
  }

  async addCompanies(
    id: string,
    request: AddCompaniesRequest,
  ): Promise<VyncoResponse<AddCompaniesResponse>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/watchlists/${encodeURIComponent(id)}/companies`,
      request,
    );
  }

  async removeCompany(id: string, uid: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/watchlists/${encodeURIComponent(id)}/companies/${encodeURIComponent(uid)}`,
    );
  }

  async events(id: string, limit?: number): Promise<VyncoResponse<EventListResponse>> {
    const path = `/v1/watchlists/${encodeURIComponent(id)}/events`;
    if (limit != null) {
      return this.#client._requestWithParams("GET", path, { limit: String(limit) });
    }
    return this.#client._request("GET", path);
  }
}
