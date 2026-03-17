import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { Person, PersonSearchParams } from "../types.js";

export class Persons {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async get(id: string): Promise<VyncoResponse<Person>> {
    return this.#client._request("GET", `/persons/${encodeURIComponent(id)}`);
  }

  async search(params: PersonSearchParams): Promise<VyncoResponse<Person[]>> {
    return this.#client._requestWithBody("POST", "/persons/search", params);
  }
}
