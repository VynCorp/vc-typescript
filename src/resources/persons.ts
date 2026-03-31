import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { BoardMember } from "../types.js";

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
}
