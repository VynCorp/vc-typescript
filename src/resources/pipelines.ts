import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  AddEntryRequest,
  CreatePipelineRequest,
  Pipeline,
  PipelineEntry,
  PipelineStats,
  PipelineWithEntries,
  UpdateEntryRequest,
} from "../types.js";

export class Pipelines {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /** List all pipelines. */
  async list(): Promise<VyncoResponse<Pipeline[]>> {
    return this.#client._request("GET", "/v1/pipelines");
  }

  /** Create a new pipeline with optional custom stages. */
  async create(request: CreatePipelineRequest): Promise<VyncoResponse<Pipeline>> {
    return this.#client._requestWithBody("POST", "/v1/pipelines", request);
  }

  /** Get a pipeline with all its entries. */
  async get(id: string): Promise<VyncoResponse<PipelineWithEntries>> {
    return this.#client._request(
      "GET",
      `/v1/pipelines/${encodeURIComponent(id)}`,
    );
  }

  /** Delete a pipeline. */
  async delete(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/pipelines/${encodeURIComponent(id)}`,
    );
  }

  /** Add a company to a pipeline. */
  async addEntry(
    id: string,
    request: AddEntryRequest,
  ): Promise<VyncoResponse<PipelineEntry>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/pipelines/${encodeURIComponent(id)}/entries`,
      request,
    );
  }

  /** Update a pipeline entry. */
  async updateEntry(
    id: string,
    entryId: string,
    request: UpdateEntryRequest,
  ): Promise<VyncoResponse<PipelineEntry>> {
    return this.#client._requestWithBody(
      "PUT",
      `/v1/pipelines/${encodeURIComponent(id)}/entries/${encodeURIComponent(entryId)}`,
      request,
    );
  }

  /** Remove an entry from a pipeline. */
  async removeEntry(id: string, entryId: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/pipelines/${encodeURIComponent(id)}/entries/${encodeURIComponent(entryId)}`,
    );
  }

  /** Get aggregate statistics for a pipeline. */
  async stats(id: string): Promise<VyncoResponse<PipelineStats>> {
    return this.#client._request(
      "GET",
      `/v1/pipelines/${encodeURIComponent(id)}/stats`,
    );
  }
}
