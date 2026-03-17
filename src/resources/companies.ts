import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type {
  Company,
  CompanyChange,
  CompanyComparison,
  CompanyCount,
  CompanyRelationship,
  CompanySearchParams,
  Dossier,
  PaginatedResponse,
  PersonRole,
} from "../types.js";

export class Companies {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async search(
    params?: CompanySearchParams,
  ): Promise<VyncoResponse<PaginatedResponse<Company>>> {
    if (!params) return this.#client._request("GET", "/companies");
    const queryParams: Record<string, string> = {};
    if (params.search != null) queryParams.search = params.search;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.legalForm != null) queryParams.legalForm = params.legalForm;
    if (params.status != null) queryParams.status = params.status;
    if (params.sortBy != null) queryParams.sortBy = params.sortBy;
    if (params.sortDesc != null) queryParams.sortDesc = String(params.sortDesc);
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/companies", queryParams);
  }

  async get(uid: string): Promise<VyncoResponse<Company>> {
    return this.#client._request("GET", `/companies/${encodeURIComponent(uid)}`);
  }

  async count(params?: CompanySearchParams): Promise<VyncoResponse<CompanyCount>> {
    if (!params) return this.#client._request("GET", "/companies/count");
    const queryParams: Record<string, string> = {};
    if (params.search != null) queryParams.search = params.search;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.legalForm != null) queryParams.legalForm = params.legalForm;
    if (params.status != null) queryParams.status = params.status;
    return this.#client._requestWithParams("GET", "/companies/count", queryParams);
  }

  async statistics(): Promise<VyncoResponse<unknown>> {
    return this.#client._request("GET", "/companies/statistics");
  }

  async changes(uid: string): Promise<VyncoResponse<CompanyChange[]>> {
    return this.#client._request("GET", `/companies/${encodeURIComponent(uid)}/changes`);
  }

  async persons(uid: string): Promise<VyncoResponse<PersonRole[]>> {
    return this.#client._request("GET", `/companies/${encodeURIComponent(uid)}/persons`);
  }

  async dossier(uid: string): Promise<VyncoResponse<Dossier>> {
    return this.#client._request("GET", `/companies/${encodeURIComponent(uid)}/dossier`);
  }

  async relationships(uid: string): Promise<VyncoResponse<CompanyRelationship[]>> {
    return this.#client._request(
      "GET",
      `/companies/${encodeURIComponent(uid)}/relationships`,
    );
  }

  async hierarchy(
    uid: string,
    type?: string,
  ): Promise<VyncoResponse<unknown>> {
    const path = `/companies/${encodeURIComponent(uid)}/hierarchy`;
    if (type) {
      return this.#client._requestWithParams("GET", path, { type });
    }
    return this.#client._request("GET", path);
  }

  async compare(uids: string[]): Promise<VyncoResponse<CompanyComparison>> {
    return this.#client._requestWithBody("POST", "/companies/compare", { uids });
  }
}
