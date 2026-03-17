import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { Dossier, GenerateDossierRequest } from "../types.js";

export class Dossiers {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async generate(
    uid: string,
    request: GenerateDossierRequest,
  ): Promise<VyncoResponse<Dossier>> {
    return this.#client._requestWithBody("POST", "/dossiers", {
      uid,
      ...request,
    });
  }
}
