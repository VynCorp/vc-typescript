import {
  AuthenticationError,
  ConfigError,
  ConflictError,
  DeserializeError,
  type ErrorBody,
  ForbiddenError,
  InsufficientCreditsError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "./errors.js";
import { type ResponseMeta, type VyncoResponse, parseResponseMeta } from "./response.js";
import type { ExportFile } from "./types.js";
import {
  Ai,
  Analytics,
  ApiKeys,
  Auditors,
  Billing,
  Changes,
  Companies,
  Credits,
  Dashboard,
  Dossiers,
  Exports,
  Graph,
  Health,
  Persons,
  Screening,
  Teams,
  Watchlists,
  Webhooks,
} from "./resources/index.js";

const VERSION = "2.0.0";
const DEFAULT_BASE_URL = "https://api.vynco.ch";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 500;

export interface VyncoClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export class VyncoClient {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #timeout: number;
  readonly #maxRetries: number;

  readonly health: Health;
  readonly companies: Companies;
  readonly auditors: Auditors;
  readonly dashboard: Dashboard;
  readonly screening: Screening;
  readonly watchlists: Watchlists;
  readonly webhooks: Webhooks;
  readonly exports: Exports;
  readonly ai: Ai;
  readonly apiKeys: ApiKeys;
  readonly credits: Credits;
  readonly billing: Billing;
  readonly teams: Teams;
  readonly changes: Changes;
  readonly persons: Persons;
  readonly analytics: Analytics;
  readonly dossiers: Dossiers;
  readonly graph: Graph;

  constructor(options: VyncoClientOptions) {
    if (!options.apiKey) {
      throw new ConfigError("API key must not be empty");
    }

    this.#apiKey = options.apiKey;
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.#maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

    this.health = new Health(this);
    this.companies = new Companies(this);
    this.auditors = new Auditors(this);
    this.dashboard = new Dashboard(this);
    this.screening = new Screening(this);
    this.watchlists = new Watchlists(this);
    this.webhooks = new Webhooks(this);
    this.exports = new Exports(this);
    this.ai = new Ai(this);
    this.apiKeys = new ApiKeys(this);
    this.credits = new Credits(this);
    this.billing = new Billing(this);
    this.teams = new Teams(this);
    this.changes = new Changes(this);
    this.persons = new Persons(this);
    this.analytics = new Analytics(this);
    this.dossiers = new Dossiers(this);
    this.graph = new Graph(this);
  }

  /** @internal */
  async _request<T>(method: string, path: string): Promise<VyncoResponse<T>> {
    const response = await this.#fetchWithRetry(method, path);
    return this.#parseResponse<T>(response);
  }

  /** @internal */
  async _requestWithBody<T>(
    method: string,
    path: string,
    body: unknown,
  ): Promise<VyncoResponse<T>> {
    const response = await this.#fetchWithRetry(method, path, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    return this.#parseResponse<T>(response);
  }

  /** @internal */
  async _requestWithParams<T>(
    method: string,
    path: string,
    params: Record<string, string>,
  ): Promise<VyncoResponse<T>> {
    const query = new URLSearchParams(params).toString();
    const fullPath = query ? `${path}?${query}` : path;
    const response = await this.#fetchWithRetry(method, fullPath);
    return this.#parseResponse<T>(response);
  }

  /** @internal */
  async _requestEmpty(method: string, path: string): Promise<ResponseMeta> {
    const response = await this.#fetchWithRetry(method, path);
    this.#throwIfError(response, undefined);
    return parseResponseMeta(response.headers);
  }

  /** @internal — returns raw bytes for file downloads (exports, graph export). */
  async _requestBytes(method: string, path: string): Promise<ExportFile> {
    const response = await this.#fetchWithRetry(method, path);
    this.#throwIfError(response, undefined);
    const meta = parseResponseMeta(response.headers);
    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? undefined;
    const disposition = response.headers.get("content-disposition") ?? undefined;
    let filename: string | undefined;
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    }
    return { bytes, contentType, filename, meta } as ExportFile & { meta: ResponseMeta };
  }

  async #fetchWithRetry(
    method: string,
    path: string,
    init?: { body?: string; headers?: Record<string, string> },
  ): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.#maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = await this.#retryDelay(attempt, lastError);
        await sleep(delay);
      }

      let response: Response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.#timeout);

        response = await fetch(`${this.#baseUrl}${path}`, {
          method,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${this.#apiKey}`,
            "User-Agent": `vynco-ts/${VERSION}`,
            ...init?.headers,
          },
          body: init?.body,
        });

        clearTimeout(timeoutId);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new TimeoutError();
        }
        lastError = err;
        if (attempt === this.#maxRetries) {
          throw new NetworkError(err);
        }
        continue;
      }

      if (response.status === 429 || response.status >= 500) {
        lastError = response;
        if (attempt < this.#maxRetries) continue;
      }

      return response;
    }

    // Should not be reached, but handle gracefully
    throw new NetworkError(lastError);
  }

  async #retryDelay(attempt: number, lastError: unknown): Promise<number> {
    // Check Retry-After header if available
    if (lastError instanceof Response) {
      const retryAfter = lastError.headers.get("retry-after");
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) return seconds * 1000;
      }
    }
    return INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
  }

  async #parseResponse<T>(response: Response): Promise<VyncoResponse<T>> {
    const meta = parseResponseMeta(response.headers);
    const text = await response.text();

    let body: unknown;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch (err) {
      throw new DeserializeError(err);
    }

    this.#throwIfError(response, body);

    return { data: body as T, meta };
  }

  #throwIfError(response: Response, body: unknown): void {
    if (response.ok) return;

    const errorBody: ErrorBody = isErrorBody(body)
      ? body
      : {
          detail: response.statusText || "Unknown error",
          message: response.statusText || "Unknown error",
          status: response.status,
        };

    switch (response.status) {
      case 400:
      case 422:
        throw new ValidationError(errorBody);
      case 401:
        throw new AuthenticationError(errorBody);
      case 402:
        throw new InsufficientCreditsError(errorBody);
      case 403:
        throw new ForbiddenError(errorBody);
      case 404:
        throw new NotFoundError(errorBody);
      case 409:
        throw new ConflictError(errorBody);
      case 429:
        throw new RateLimitError(errorBody);
      default:
        throw new ServerError(errorBody);
    }
  }
}

/** Extract a list from flexible API response shapes. */
export function extractList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.detail === "string" || typeof obj.message === "string";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
