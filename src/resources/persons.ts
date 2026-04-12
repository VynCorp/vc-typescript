import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  BoardMember,
  BoardMemberParams,
  PagedResponse,
  PersonDetail,
  PersonNetworkResponse,
  PersonSearchParams,
  PersonSearchResult,
} from "../types.js";

export class Persons {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /**
   * Get board members of a company.
   *
   * Supports optional pagination via `params.page` (1-indexed) and
   * `params.pageSize` (max 500, default 100 on the server). Pagination is
   * essential for companies with large boards (e.g. UBS has 1,100+
   * registered signatories).
   */
  async boardMembers(
    uid: string,
    params?: BoardMemberParams,
  ): Promise<VyncoResponse<BoardMember[]>> {
    const path = `/v1/persons/board-members/${encodeURIComponent(uid)}`;
    if (!params) return this.#client._request("GET", path);
    const queryParams: Record<string, string> = {};
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    if (Object.keys(queryParams).length === 0) {
      return this.#client._request("GET", path);
    }
    return this.#client._requestWithParams("GET", path, queryParams);
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

  /**
   * Get a person-centric network view.
   *
   * Returns the person's companies, co-directors (persons they share
   * directorships with), and summary statistics. Useful for compliance
   * investigations that start from a person rather than a company.
   */
  async network(id: string): Promise<VyncoResponse<PersonNetworkResponse>> {
    return this.#client._request(
      "GET",
      `/v1/persons/${encodeURIComponent(id)}/network`,
    );
  }
}
