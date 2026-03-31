import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { CreateExportRequest, ExportDownload, ExportFile, ExportJob } from "../types.js";

export class Exports {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async create(request: CreateExportRequest): Promise<VyncoResponse<ExportJob>> {
    return this.#client._requestWithBody("POST", "/v1/exports", request);
  }

  async get(id: string): Promise<VyncoResponse<ExportDownload>> {
    return this.#client._request("GET", `/v1/exports/${encodeURIComponent(id)}`);
  }

  async download(id: string): Promise<ExportFile> {
    return this.#client._requestBytes(
      "GET",
      `/v1/exports/${encodeURIComponent(id)}/download`,
    );
  }
}
