import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  Acquisition,
  Classification,
  Company,
  CompanyCount,
  CompanyFullResponse,
  CompanyListParams,
  CompanyReport,
  CompanyStatistics,
  CompareRequest,
  CompareResponse,
  CorporateStructure,
  CreateNoteRequest,
  CreateTagRequest,
  EventListResponse,
  ExcelExportRequest,
  ExportFile,
  Fingerprint,
  HierarchyResponse,
  MediaAnalysisResponse,
  MediaParams,
  MediaResponse,
  NearbyCompany,
  NearbyParams,
  NewsItem,
  Note,
  PagedResponse,
  Relationship,
  SimilarCompaniesResponse,
  SimilarParams,
  Tag,
  TagSummary,
  TimelineParams,
  TimelineResponse,
  TimelineSummaryResponse,
  UboResponse,
  UpdateNoteRequest,
} from "../types.js";

export class Companies {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async list(
    params?: CompanyListParams,
  ): Promise<VyncoResponse<PagedResponse<Company>>> {
    if (!params) return this.#client._request("GET", "/v1/companies");
    const queryParams: Record<string, string> = {};
    if (params.search != null) queryParams.search = params.search;
    if (params.canton != null) queryParams.canton = params.canton;
    if (params.changedSince != null) queryParams.changed_since = params.changedSince;
    if (params.status != null) queryParams.status = params.status;
    if (params.legalForm != null) queryParams.legalForm = params.legalForm;
    if (params.capitalMin != null) queryParams.capitalMin = String(params.capitalMin);
    if (params.capitalMax != null) queryParams.capitalMax = String(params.capitalMax);
    if (params.auditorCategory != null) queryParams.auditorCategory = params.auditorCategory;
    if (params.sortBy != null) queryParams.sortBy = params.sortBy;
    if (params.sortDesc != null) queryParams.sortDesc = String(params.sortDesc);
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return this.#client._requestWithParams("GET", "/v1/companies", queryParams);
  }

  async get(uid: string): Promise<VyncoResponse<Company>> {
    return this.#client._request("GET", `/v1/companies/${encodeURIComponent(uid)}`);
  }

  async getFull(uid: string): Promise<VyncoResponse<CompanyFullResponse>> {
    return this.#client._request("GET", `/v1/companies/${encodeURIComponent(uid)}/full`);
  }

  async count(): Promise<VyncoResponse<CompanyCount>> {
    return this.#client._request("GET", "/v1/companies/count");
  }

  async events(uid: string, limit?: number): Promise<VyncoResponse<EventListResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/events`;
    if (limit != null) {
      return this.#client._requestWithParams("GET", path, { limit: String(limit) });
    }
    return this.#client._request("GET", path);
  }

  async statistics(): Promise<VyncoResponse<CompanyStatistics>> {
    return this.#client._request("GET", "/v1/companies/statistics");
  }

  async compare(request: CompareRequest): Promise<VyncoResponse<CompareResponse>> {
    return this.#client._requestWithBody("POST", "/v1/companies/compare", request);
  }

  async news(uid: string): Promise<VyncoResponse<NewsItem[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/news`,
    );
  }

  async reports(uid: string): Promise<VyncoResponse<CompanyReport[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/reports`,
    );
  }

  async relationships(uid: string): Promise<VyncoResponse<Relationship[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/relationships`,
    );
  }

  async hierarchy(uid: string): Promise<VyncoResponse<HierarchyResponse>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/hierarchy`,
    );
  }

  async classification(uid: string): Promise<VyncoResponse<Classification>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/classification`,
    );
  }

  async fingerprint(uid: string): Promise<VyncoResponse<Fingerprint>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/fingerprint`,
    );
  }

  async structure(uid: string): Promise<VyncoResponse<CorporateStructure>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/structure`,
    );
  }

  async acquisitions(uid: string): Promise<VyncoResponse<Acquisition[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/acquisitions`,
    );
  }

  async nearby(params: NearbyParams): Promise<VyncoResponse<NearbyCompany[]>> {
    const queryParams: Record<string, string> = {
      lat: String(params.lat),
      lng: String(params.lng),
    };
    if (params.radiusKm != null) queryParams.radiusKm = String(params.radiusKm);
    if (params.limit != null) queryParams.limit = String(params.limit);
    return this.#client._requestWithParams("GET", "/v1/companies/nearby", queryParams);
  }

  // -- Notes --

  async notes(uid: string): Promise<VyncoResponse<Note[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/notes`,
    );
  }

  async createNote(uid: string, request: CreateNoteRequest): Promise<VyncoResponse<Note>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/companies/${encodeURIComponent(uid)}/notes`,
      request,
    );
  }

  async updateNote(
    uid: string,
    noteId: string,
    request: UpdateNoteRequest,
  ): Promise<VyncoResponse<Note>> {
    return this.#client._requestWithBody(
      "PUT",
      `/v1/companies/${encodeURIComponent(uid)}/notes/${encodeURIComponent(noteId)}`,
      request,
    );
  }

  async deleteNote(uid: string, noteId: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/companies/${encodeURIComponent(uid)}/notes/${encodeURIComponent(noteId)}`,
    );
  }

  // -- Tags --

  async tags(uid: string): Promise<VyncoResponse<Tag[]>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/tags`,
    );
  }

  async createTag(uid: string, request: CreateTagRequest): Promise<VyncoResponse<Tag>> {
    return this.#client._requestWithBody(
      "POST",
      `/v1/companies/${encodeURIComponent(uid)}/tags`,
      request,
    );
  }

  async deleteTag(uid: string, tagId: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/companies/${encodeURIComponent(uid)}/tags/${encodeURIComponent(tagId)}`,
    );
  }

  async allTags(): Promise<VyncoResponse<TagSummary[]>> {
    return this.#client._request("GET", "/v1/tags");
  }

  // -- Timeline (v3.1+) --

  /** Get a chronological timeline of a company's changes. */
  async timeline(
    uid: string,
    params?: TimelineParams,
  ): Promise<VyncoResponse<TimelineResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/timeline`;
    if (!params) return this.#client._request("GET", path);
    const queryParams: Record<string, string> = {};
    if (params.since != null) queryParams.since = params.since;
    if (params.until != null) queryParams.until = params.until;
    if (params.changeType != null) queryParams.changeType = params.changeType;
    if (Object.keys(queryParams).length === 0) return this.#client._request("GET", path);
    return this.#client._requestWithParams("GET", path, queryParams);
  }

  /** Get an AI-generated narrative summary of a company timeline. */
  async timelineSummary(
    uid: string,
    params?: TimelineParams,
  ): Promise<VyncoResponse<TimelineSummaryResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/timeline/summary`;
    if (!params) return this.#client._request("GET", path);
    const queryParams: Record<string, string> = {};
    if (params.since != null) queryParams.since = params.since;
    if (params.until != null) queryParams.until = params.until;
    if (params.changeType != null) queryParams.changeType = params.changeType;
    if (Object.keys(queryParams).length === 0) return this.#client._request("GET", path);
    return this.#client._requestWithParams("GET", path, queryParams);
  }

  // -- Similar companies (v3.1+) --

  /**
   * Find companies scored by similarity on industry (40pts), canton (20pts),
   * capital (20pts), legal form (10pts), and auditor tier (10pts).
   */
  async similar(
    uid: string,
    params?: SimilarParams,
  ): Promise<VyncoResponse<SimilarCompaniesResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/similar`;
    if (!params?.limit) return this.#client._request("GET", path);
    return this.#client._requestWithParams("GET", path, {
      limit: String(params.limit),
    });
  }

  // -- UBO (v3.1+) --

  /** Resolve the ultimate beneficial owner(s) of a company. */
  async ubo(uid: string): Promise<VyncoResponse<UboResponse>> {
    return this.#client._request(
      "GET",
      `/v1/companies/${encodeURIComponent(uid)}/ubo`,
    );
  }

  // -- Media / News with sentiment (v3.1+) --

  /**
   * Get media/news items for a company, optionally filtered by sentiment.
   *
   * `params.sentiment` is one of `positive`, `neutral`, `negative`.
   */
  async media(
    uid: string,
    params?: MediaParams,
  ): Promise<VyncoResponse<MediaResponse>> {
    const path = `/v1/companies/${encodeURIComponent(uid)}/media`;
    if (!params) return this.#client._request("GET", path);
    const queryParams: Record<string, string> = {};
    if (params.sentiment != null) queryParams.sentiment = params.sentiment;
    if (params.since != null) queryParams.since = params.since;
    if (params.limit != null) queryParams.limit = String(params.limit);
    if (Object.keys(queryParams).length === 0) return this.#client._request("GET", path);
    return this.#client._requestWithParams("GET", path, queryParams);
  }

  /** Trigger LLM sentiment analysis on unanalyzed media items for a company. */
  async mediaAnalyze(uid: string): Promise<VyncoResponse<MediaAnalysisResponse>> {
    return this.#client._request(
      "POST",
      `/v1/companies/${encodeURIComponent(uid)}/media/analyze`,
    );
  }

  // -- CSV / Excel export --

  /**
   * Export companies as CSV.
   *
   * This is the canonical name; {@link Companies.exportExcel} is kept as a
   * deprecated alias. The endpoint currently emits `text/csv`.
   */
  async exportCsv(request: ExcelExportRequest): Promise<ExportFile> {
    return this.#client._requestBytesWithBody(
      "POST",
      "/v1/companies/export/excel",
      request,
    );
  }

  /**
   * @deprecated Use {@link Companies.exportCsv} instead. The server returns
   * CSV, not Excel. Will be removed in v4.0.
   */
  async exportExcel(request: ExcelExportRequest): Promise<ExportFile> {
    return this.exportCsv(request);
  }
}
