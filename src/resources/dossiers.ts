import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type { CreateDossierRequest, Dossier, DossierSummary } from "../types.js";

export class Dossiers {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async create(request: CreateDossierRequest): Promise<VyncoResponse<Dossier>> {
    return this.#client._requestWithBody("POST", "/v1/dossiers", request);
  }

  async list(): Promise<VyncoResponse<DossierSummary[]>> {
    return this.#client._request("GET", "/v1/dossiers");
  }

  async get(idOrUid: string): Promise<VyncoResponse<Dossier>> {
    return this.#client._request(
      "GET",
      `/v1/dossiers/${encodeURIComponent(idOrUid)}`,
    );
  }

  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/dossiers/${encodeURIComponent(id)}`,
    );
  }

  async generate(uid: string): Promise<VyncoResponse<Dossier>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/dossiers/${encodeURIComponent(uid)}/generate`,
      {},
    );
  }
}
