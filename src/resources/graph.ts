import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  ExportFile,
  GraphResponse,
  NetworkAnalysisRequest,
  NetworkAnalysisResponse,
} from "../types.js";

export class Graph {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async get(uid: string): Promise<VyncoResponse<GraphResponse>> {
    return this.#client._request(
      "GET",
      `/v1/graph/${encodeURIComponent(uid)}`,
    );
  }

  async export(uid: string, format: string): Promise<ExportFile> {
    return this.#client._requestBytes(
      "GET",
      `/v1/graph/${encodeURIComponent(uid)}/export?format=${encodeURIComponent(format)}`,
    );
  }

  async analyze(
    request: NetworkAnalysisRequest,
  ): Promise<VyncoResponse<NetworkAnalysisResponse>> {
    return this.#client._requestWithBody("POST", "/v1/network/analyze", request);
  }
}
