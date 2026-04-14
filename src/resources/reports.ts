import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  GeneratedIndustryReport,
  IndustryListResponse,
  IndustryReportResponse,
} from "../types.js";

export class Reports {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  /** List all industries with available reports and company counts. */
  async industries(): Promise<VyncoResponse<IndustryListResponse>> {
    return this.#client._request("GET", "/v1/reports/industries");
  }

  /** Get a detailed industry report with analytics. */
  async get(industry: string): Promise<VyncoResponse<IndustryReportResponse>> {
    return this.#client._request(
      "GET",
      `/v1/reports/industry/${encodeURIComponent(industry)}`,
    );
  }

  /** Generate an AI-powered narrative industry report. */
  async generate(industry: string): Promise<VyncoResponse<GeneratedIndustryReport>> {
    return this.#client._request(
      "POST",
      `/v1/reports/industry/${encodeURIComponent(industry)}/generate`,
    );
  }
}
