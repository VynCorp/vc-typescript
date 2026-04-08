import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  BoardMember,
  PagedResponse,
  PersonDetail,
  PersonSearchParams,
  PersonSearchResult,
} from "../types.js";

export class Persons {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async boardMembers(uid: string): Promise<VyncoResponse<BoardMember[]>> {
    return this.#client._request(
      "GET",
      `/v1/persons/board-members/${encodeURIComponent(uid)}`,
    );
  }

  async search(
    params?: PersonSearchParams,
  ): Promise<VyncoResponse<PagedResponse<PersonSearchResult>>> {
    if (!params) return this.#client._request("GET", "/v1/persons/search");
    const queryParams: Record<string, string> = {};
    if (params.q != null) queryParams.q = params.q;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/persons/search", queryParams);
  }

  async get(id: string): Promise<VyncoResponse<PersonDetail>> {
    return this.#client._request(
      "GET",
      `/v1/persons/${encodeURIComponent(id)}`,
    );
  }
}
