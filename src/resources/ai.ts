import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  AiDossierRequest,
  AiDossierResponse,
  AiSearchRequest,
  AiSearchResponse,
  BatchRiskScoreRequest,
  BatchRiskScoreResponse,
  ComparativeRequest,
  ComparativeResponse,
  PredictiveRiskRequest,
  PredictiveRiskResponse,
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

  /** Get AI risk scores for up to 50 companies in a single call. */
  async riskScoreBatch(
    request: BatchRiskScoreRequest,
  ): Promise<VyncoResponse<BatchRiskScoreResponse>> {
    return this.#client._requestWithBody("POST", "/v1/ai/risk-score/batch", request);
  }

  /** Generate an AI comparative dossier for 2-5 companies. */
  async comparative(request: ComparativeRequest): Promise<VyncoResponse<ComparativeResponse>> {
    return this.#client._requestWithBody("POST", "/v1/ai/comparative", request);
  }

  /** Get predictive risk scoring with dissolution probability. */
  async predictiveRisk(
    uid: string,
    request?: PredictiveRiskRequest,
  ): Promise<VyncoResponse<PredictiveRiskResponse>> {
    const path = `/v1/risk/predictive/${encodeURIComponent(uid)}`;
    return this.#client._requestWithBody("POST", path, request ?? {});
  }
}
