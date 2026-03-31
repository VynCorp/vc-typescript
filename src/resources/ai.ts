import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AiDossierRequest,
  AiDossierResponse,
  AiSearchRequest,
  AiSearchResponse,
  RiskScoreRequest,
  RiskScoreResponse,
} from "../types.js";

export class Ai {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async dossier(request: AiDossierRequest): Promise<VyncoResponse<AiDossierResponse>> {
    return this.#client._requestWithBody("POST", "/v1/ai/dossier", request);
  }

  async search(request: AiSearchRequest): Promise<VyncoResponse<AiSearchResponse>> {
    return this.#client._requestWithBody("POST", "/v1/ai/search", request);
  }

  async riskScore(request: RiskScoreRequest): Promise<VyncoResponse<RiskScoreResponse>> {
    return this.#client._requestWithBody("POST", "/v1/ai/risk-score", request);
  }
}
