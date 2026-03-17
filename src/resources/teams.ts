import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { CreateTeamRequest, Team } from "../types.js";

export class Teams {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async me(): Promise<VyncoResponse<Team>> {
    return this.#client._request("GET", "/teams/me");
  }

  async create(request: CreateTeamRequest): Promise<VyncoResponse<Team>> {
    return this.#client._requestWithBody("POST", "/teams", request);
  }
}
