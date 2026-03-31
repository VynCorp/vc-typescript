import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigError,
  ConflictError,
  ForbiddenError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  VyncoClient,
  extractList,
} from "../src/index.js";

const BASE_URL = "https://test.api.vynco.ch";
const API_KEY = "vc_test_abc123";

function makeClient(overrides?: { maxRetries?: number }) {
  return new VyncoClient({
    apiKey: API_KEY,
    baseUrl: BASE_URL,
    maxRetries: overrides?.maxRetries ?? 0,
  });
}

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Configuration ---

describe("configuration", () => {
  it("rejects empty API key", () => {
    expect(() => new VyncoClient({ apiKey: "" })).toThrow(ConfigError);
  });

  it("strips trailing slashes from base URL", async () => {
    const client = new VyncoClient({
      apiKey: API_KEY,
      baseUrl: "https://test.api.vynco.ch///",
      maxRetries: 0,
    });

    server.use(
      http.get("https://test.api.vynco.ch/v1/credits/balance", () =>
        HttpResponse.json({ balance: 100, monthlyCredits: 500, usedThisMonth: 50, tier: "starter" }),
      ),
    );

    const resp = await client.credits.balance();
    expect(resp.data.balance).toBe(100);
  });
});

// --- Authentication ---

describe("authentication", () => {
  it("sends Bearer token in Authorization header", async () => {
    let capturedAuth = "";

    server.use(
      http.get(`${BASE_URL}/health`, ({ request }) => {
        capturedAuth = request.headers.get("authorization") ?? "";
        return HttpResponse.json({ status: "healthy" });
      }),
    );

    await makeClient().health.check();
    expect(capturedAuth).toBe(`Bearer ${API_KEY}`);
  });
});

// --- Error Mapping ---

describe("error mapping", () => {
  const errorBody = { detail: "test error", message: "test error", status: 0 };

  it("maps 401 to AuthenticationError", async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json({ ...errorBody, status: 401 }, { status: 401 }),
      ),
    );
    await expect(makeClient().health.check()).rejects.toThrow(AuthenticationError);
  });

  it("maps 402 to InsufficientCreditsError", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/credits/balance`, () =>
        HttpResponse.json({ ...errorBody, status: 402 }, { status: 402 }),
      ),
    );
    await expect(makeClient().credits.balance()).rejects.toThrow(InsufficientCreditsError);
  });

  it("maps 403 to ForbiddenError", async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json({ ...errorBody, status: 403 }, { status: 403 }),
      ),
    );
    await expect(makeClient().health.check()).rejects.toThrow(ForbiddenError);
  });

  it("maps 404 to NotFoundError", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid`, () =>
        HttpResponse.json({ ...errorBody, status: 404 }, { status: 404 }),
      ),
    );
    await expect(makeClient().companies.get("CHE-000")).rejects.toThrow(NotFoundError);
  });

  it("maps 400 to ValidationError", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/api-keys`, () =>
        HttpResponse.json({ ...errorBody, status: 400 }, { status: 400 }),
      ),
    );
    await expect(
      makeClient().apiKeys.create({ name: "" }),
    ).rejects.toThrow(ValidationError);
  });

  it("maps 409 to ConflictError", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/watchlists`, () =>
        HttpResponse.json({ ...errorBody, status: 409 }, { status: 409 }),
      ),
    );
    await expect(
      makeClient().watchlists.create({ name: "dupe" }),
    ).rejects.toThrow(ConflictError);
  });

  it("maps 422 to ValidationError", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/api-keys`, () =>
        HttpResponse.json({ ...errorBody, status: 422 }, { status: 422 }),
      ),
    );
    await expect(
      makeClient().apiKeys.create({ name: "x" }),
    ).rejects.toThrow(ValidationError);
  });

  it("maps 429 to RateLimitError", async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json({ ...errorBody, status: 429 }, { status: 429 }),
      ),
    );
    await expect(makeClient().health.check()).rejects.toThrow(RateLimitError);
  });

  it("maps 500 to ServerError", async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json({ ...errorBody, status: 500 }, { status: 500 }),
      ),
    );
    await expect(makeClient().health.check()).rejects.toThrow(ServerError);
  });

  it("maps 503 to ServerError", async () => {
    server.use(
      http.get(`${BASE_URL}/health`, () =>
        HttpResponse.json({ ...errorBody, status: 503 }, { status: 503 }),
      ),
    );
    await expect(makeClient().health.check()).rejects.toThrow(ServerError);
  });
});

// --- Response Metadata ---

describe("response metadata", () => {
  it("parses all metadata headers", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/credits/balance`, () =>
        HttpResponse.json(
          { balance: 100, monthlyCredits: 500, usedThisMonth: 50, tier: "starter" },
          {
            headers: {
              "x-request-id": "req-123",
              "x-credits-used": "5",
              "x-credits-remaining": "95",
              "x-ratelimit-limit": "60",
              "x-ratelimit-remaining": "55",
              "x-ratelimit-reset": "1700000000",
              "x-data-source": "zefix",
            },
          },
        ),
      ),
    );

    const resp = await makeClient().credits.balance();
    expect(resp.meta.requestId).toBe("req-123");
    expect(resp.meta.creditsUsed).toBe(5);
    expect(resp.meta.creditsRemaining).toBe(95);
    expect(resp.meta.rateLimitLimit).toBe(60);
    expect(resp.meta.rateLimitRemaining).toBe(55);
    expect(resp.meta.rateLimitReset).toBe(1700000000);
    expect(resp.meta.dataSource).toBe("zefix");
  });

  it("handles missing metadata headers gracefully", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/credits/balance`, () =>
        HttpResponse.json({ balance: 0, monthlyCredits: 0, usedThisMonth: 0, tier: "" }),
      ),
    );

    const resp = await makeClient().credits.balance();
    expect(resp.meta.requestId).toBeUndefined();
    expect(resp.meta.creditsUsed).toBeUndefined();
  });
});

// --- Health ---

describe("health", () => {
  it("checks health at root path (no /v1 prefix)", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/health`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ status: "healthy", version: "2.0.0", uptime: "5d 3h" });
      }),
    );

    const resp = await makeClient().health.check();
    expect(resp.data.status).toBe("healthy");
    expect(capturedUrl).toContain("/health");
    expect(capturedUrl).not.toContain("/v1/health");
  });
});

// --- Companies ---

describe("companies", () => {
  it("lists with query params", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/companies`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().companies.list({ search: "Nestlé", canton: "VD", page: 1, pageSize: 20 });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("search")).toBe("Nestlé");
    expect(url.searchParams.get("canton")).toBe("VD");
  });

  it("gets company by UID", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid`, ({ params }) =>
        HttpResponse.json({
          uid: params.uid, name: "Test AG", canton: "ZH", status: "active",
          legalForm: "AG", auditorCategory: "regulated",
        }),
      ),
    );

    const resp = await makeClient().companies.get("CHE-123.456.789");
    expect(resp.data.uid).toBe("CHE-123.456.789");
    expect(resp.data.name).toBe("Test AG");
  });

  it("gets company count", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/count`, () =>
        HttpResponse.json({ count: 42 }),
      ),
    );

    const resp = await makeClient().companies.count();
    expect(resp.data.count).toBe(42);
  });

  it("gets company events", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid/events`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ events: [], count: 0 });
      }),
    );

    await makeClient().companies.events("CHE-123", 10);
    expect(new URL(capturedUrl).searchParams.get("limit")).toBe("10");
  });

  it("compares companies via POST", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/companies/compare`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          companies: [], dimensions: ["capital"],
          similarities: ["same canton"], differences: ["different capital"],
        });
      }),
    );

    const resp = await makeClient().companies.compare({ uids: ["CHE-1", "CHE-2"] });
    expect(capturedBody).toEqual({ uids: ["CHE-1", "CHE-2"] });
    expect(resp.data.dimensions).toContain("capital");
  });

  it("gets company news", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid/news`, () =>
        HttpResponse.json([
          { id: "n1", title: "News", sourceType: "press", publishedAt: "2026-01-01" },
        ]),
      ),
    );

    const resp = await makeClient().companies.news("CHE-123");
    expect(resp.data).toHaveLength(1);
  });

  it("gets company reports", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid/reports`, () =>
        HttpResponse.json([
          { reportType: "annual", description: "Annual Report 2025" },
        ]),
      ),
    );

    const resp = await makeClient().companies.reports("CHE-123");
    expect(resp.data).toHaveLength(1);
  });

  it("gets company fingerprint", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid/fingerprint`, ({ params }) =>
        HttpResponse.json({
          companyUid: params.uid, name: "Test AG", changeFrequency: 3,
          boardSize: 5, companyAge: 10, canton: "ZH", legalForm: "AG",
          hasParentCompany: false, subsidiaryCount: 2,
          generatedAt: "2026-01-01", fingerprintVersion: "1.0",
        }),
      ),
    );

    const resp = await makeClient().companies.fingerprint("CHE-123");
    expect(resp.data.companyUid).toBe("CHE-123");
    expect(resp.data.boardSize).toBe(5);
  });

  it("gets nearby companies", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/companies/nearby`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([
          { uid: "CHE-1", name: "Nearby AG", distance: 0.5, latitude: 47.3, longitude: 8.5 },
        ]);
      }),
    );

    const resp = await makeClient().companies.nearby({ lat: 47.3, lng: 8.5, radiusKm: 5 });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("lat")).toBe("47.3");
    expect(url.searchParams.get("radiusKm")).toBe("5");
    expect(resp.data).toHaveLength(1);
  });
});

// --- Auditors ---

describe("auditors", () => {
  it("gets auditor history for a company", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/companies/:uid/auditor-history`, ({ params }) =>
        HttpResponse.json({
          companyUid: params.uid, companyName: "Test AG",
          currentAuditor: "PwC", history: [],
        }),
      ),
    );

    const resp = await makeClient().auditors.history("CHE-123");
    expect(resp.data.currentAuditor).toBe("PwC");
  });

  it("lists auditor tenures with params", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/auditor-tenures`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().auditors.tenures({ minYears: 10, canton: "ZH" });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("min_years")).toBe("10");
    expect(url.searchParams.get("canton")).toBe("ZH");
  });
});

// --- Dashboard ---

describe("dashboard", () => {
  it("gets dashboard data", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/dashboard`, () =>
        HttpResponse.json({ totalCompanies: 1000, recentChanges: 50 }),
      ),
    );

    const resp = await makeClient().dashboard.get();
    expect(resp.data.totalCompanies).toBe(1000);
  });
});

// --- Screening ---

describe("screening", () => {
  it("screens a name", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/screening`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          queryName: "Test Corp", screenedAt: "2026-01-01",
          hitCount: 0, riskLevel: "low", hits: [], sourcesChecked: ["sanctions"],
        });
      }),
    );

    const resp = await makeClient().screening.screen({ name: "Test Corp" });
    expect(capturedBody).toEqual({ name: "Test Corp" });
    expect(resp.data.riskLevel).toBe("low");
  });
});

// --- Watchlists ---

describe("watchlists", () => {
  it("lists watchlists", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/watchlists`, () =>
        HttpResponse.json([
          { id: "w1", name: "My List", createdAt: "2026-01-01", companyCount: 5 },
        ]),
      ),
    );

    const resp = await makeClient().watchlists.list();
    expect(resp.data).toHaveLength(1);
  });

  it("creates a watchlist", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/watchlists`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "w1", name: "New List", createdAt: "2026-01-01", companyCount: 0,
        });
      }),
    );

    const resp = await makeClient().watchlists.create({ name: "New List" });
    expect(capturedBody).toEqual({ name: "New List" });
    expect(resp.data.id).toBe("w1");
  });

  it("deletes a watchlist", async () => {
    server.use(
      http.delete(`${BASE_URL}/v1/watchlists/:id`, () =>
        new HttpResponse(null, { status: 204, headers: { "x-request-id": "req-del" } }),
      ),
    );

    const meta = await makeClient().watchlists.delete("w1");
    expect(meta.requestId).toBe("req-del");
  });

  it("adds companies to a watchlist", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/watchlists/:id/companies`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ added: 2, alreadyPresent: 0 });
      }),
    );

    const resp = await makeClient().watchlists.addCompanies("w1", { uids: ["CHE-1", "CHE-2"] });
    expect(capturedBody).toEqual({ uids: ["CHE-1", "CHE-2"] });
    expect(resp.data.added).toBe(2);
  });
});

// --- Webhooks ---

describe("webhooks", () => {
  it("creates a webhook with signing secret", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/webhooks`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "wh1", url: "https://example.com/hook", status: "active",
          signingSecret: "whsec_abc123", createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().webhooks.create({
      url: "https://example.com/hook",
      eventFilters: ["company.changed"],
    });
    expect(capturedBody).toMatchObject({ url: "https://example.com/hook" });
    expect(resp.data.signingSecret).toBe("whsec_abc123");
  });

  it("updates a webhook", async () => {
    server.use(
      http.put(`${BASE_URL}/v1/webhooks/:id`, () =>
        HttpResponse.json({
          id: "wh1", url: "https://example.com/hook2", status: "active",
          createdAt: "2026-01-01",
        }),
      ),
    );

    const resp = await makeClient().webhooks.update("wh1", { url: "https://example.com/hook2" });
    expect(resp.data.url).toBe("https://example.com/hook2");
  });

  it("deletes a webhook", async () => {
    server.use(
      http.delete(`${BASE_URL}/v1/webhooks/:id`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );

    const meta = await makeClient().webhooks.delete("wh1");
    expect(meta).toBeDefined();
  });

  it("tests a webhook", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/webhooks/:id/test`, () =>
        HttpResponse.json({ success: true, httpStatus: 200, deliveredAt: "2026-01-01" }),
      ),
    );

    const resp = await makeClient().webhooks.test("wh1");
    expect(resp.data.success).toBe(true);
  });
});

// --- Exports ---

describe("exports", () => {
  it("creates an export job", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/exports`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "e1", status: "pending", format: "csv", createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().exports.create({ format: "csv", canton: "ZH" });
    expect(capturedBody).toEqual({ format: "csv", canton: "ZH" });
    expect(resp.data.status).toBe("pending");
  });

  it("gets export status", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/exports/:id`, () =>
        HttpResponse.json({
          job: { id: "e1", status: "completed", format: "csv", createdAt: "2026-01-01", totalRows: 500 },
        }),
      ),
    );

    const resp = await makeClient().exports.get("e1");
    expect(resp.data.job.status).toBe("completed");
  });
});

// --- AI ---

describe("ai", () => {
  it("generates an AI dossier", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/ai/dossier`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          uid: "CHE-123", companyName: "Test AG",
          dossier: "AI-generated content", sources: ["zefix"],
          generatedAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().ai.dossier({ uid: "CHE-123", depth: "detailed" });
    expect(capturedBody).toEqual({ uid: "CHE-123", depth: "detailed" });
    expect(resp.data.dossier).toContain("AI-generated");
  });

  it("searches via AI", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/ai/search`, () =>
        HttpResponse.json({
          query: "fintech in Zurich", explanation: "Found 5 matches",
          filtersApplied: {}, results: [], total: 0,
        }),
      ),
    );

    const resp = await makeClient().ai.search({ query: "fintech in Zurich" });
    expect(resp.data.explanation).toContain("5 matches");
  });

  it("scores risk", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/ai/risk-score`, () =>
        HttpResponse.json({
          uid: "CHE-123", companyName: "Test AG", overallScore: 35,
          riskLevel: "low", breakdown: [], assessedAt: "2026-01-01",
        }),
      ),
    );

    const resp = await makeClient().ai.riskScore({ uid: "CHE-123" });
    expect(resp.data.overallScore).toBe(35);
    expect(resp.data.riskLevel).toBe("low");
  });
});

// --- Changes ---

describe("changes", () => {
  it("lists changes with params", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/changes`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().changes.list({ type: "StatusChange", page: 1, pageSize: 10 });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("type")).toBe("StatusChange");
    expect(url.searchParams.get("pageSize")).toBe("10");
  });

  it("gets changes by company", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/changes/:uid`, () =>
        HttpResponse.json([
          {
            id: "c1", companyUid: "CHE-123", changeType: "StatusChange",
            detectedAt: "2026-01-01",
          },
        ]),
      ),
    );

    const resp = await makeClient().changes.byCompany("CHE-123");
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].changeType).toBe("StatusChange");
  });

  it("gets change statistics", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/changes/statistics`, () =>
        HttpResponse.json({
          totalChanges: 1000, changesThisWeek: 50,
          changesThisMonth: 200, byType: { StatusChange: 200 },
        }),
      ),
    );

    const resp = await makeClient().changes.statistics();
    expect(resp.data.totalChanges).toBe(1000);
  });
});

// --- Persons ---

describe("persons", () => {
  it("gets board members for a company", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/persons/board-members/:uid`, () =>
        HttpResponse.json([
          { name: "Hans Müller", role: "CEO", signatureAuthority: "sole" },
        ]),
      ),
    );

    const resp = await makeClient().persons.boardMembers("CHE-123");
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].name).toBe("Hans Müller");
  });
});

// --- Dossiers ---

describe("dossiers", () => {
  it("creates a dossier", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/dossiers`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "d1", companyUid: "CHE-123", companyName: "Test AG",
          level: "standard", content: "Dossier content",
          sources: ["zefix"], createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().dossiers.create({ uid: "CHE-123", level: "standard" });
    expect(capturedBody).toEqual({ uid: "CHE-123", level: "standard" });
    expect(resp.data.companyUid).toBe("CHE-123");
  });

  it("lists dossier summaries", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/dossiers`, () =>
        HttpResponse.json([
          { id: "d1", companyUid: "CHE-123", companyName: "Test AG", level: "standard", createdAt: "2026-01-01" },
        ]),
      ),
    );

    const resp = await makeClient().dossiers.list();
    expect(resp.data).toHaveLength(1);
  });

  it("gets a dossier by ID", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/dossiers/:id`, () =>
        HttpResponse.json({
          id: "d1", companyUid: "CHE-123", companyName: "Test AG",
          level: "standard", content: "Full content",
          sources: [], createdAt: "2026-01-01",
        }),
      ),
    );

    const resp = await makeClient().dossiers.get("d1");
    expect(resp.data.content).toBe("Full content");
  });

  it("deletes a dossier", async () => {
    server.use(
      http.delete(`${BASE_URL}/v1/dossiers/:id`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );

    const meta = await makeClient().dossiers.delete("d1");
    expect(meta).toBeDefined();
  });
});

// --- Credits ---

describe("credits", () => {
  it("gets credit balance", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/credits/balance`, () =>
        HttpResponse.json({ balance: 1000, monthlyCredits: 2000, usedThisMonth: 500, tier: "professional" }),
      ),
    );

    const resp = await makeClient().credits.balance();
    expect(resp.data.balance).toBe(1000);
    expect(resp.data.tier).toBe("professional");
  });

  it("gets usage with since parameter", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/credits/usage`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ operations: [], total: 0, period: "2026-01" });
      }),
    );

    await makeClient().credits.usage("2026-01-01");
    expect(new URL(capturedUrl).searchParams.get("since")).toBe("2026-01-01");
  });

  it("gets credit history", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/credits/history`, () =>
        HttpResponse.json({ items: [], total: 0 }),
      ),
    );

    const resp = await makeClient().credits.history();
    expect(resp.data.total).toBe(0);
  });
});

// --- API Keys ---

describe("api keys", () => {
  it("creates an API key", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/api-keys`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "k1", name: "test-key", key: "vc_test_raw123",
          environment: "test", scopes: ["read"], createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().apiKeys.create({
      name: "test-key", environment: "test", scopes: ["read"],
    });
    expect(capturedBody).toEqual({ name: "test-key", environment: "test", scopes: ["read"] });
    expect(resp.data.key).toBe("vc_test_raw123");
  });

  it("revokes an API key and returns metadata only", async () => {
    server.use(
      http.delete(`${BASE_URL}/v1/api-keys/:id`, () =>
        new HttpResponse(null, { status: 204, headers: { "x-request-id": "req-del" } }),
      ),
    );

    const meta = await makeClient().apiKeys.revoke("k1");
    expect(meta.requestId).toBe("req-del");
  });
});

// --- Billing ---

describe("billing", () => {
  it("creates checkout session", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/billing/checkout-session`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ url: "https://checkout.stripe.com/session123" });
      }),
    );

    const resp = await makeClient().billing.createCheckout("professional");
    expect(capturedBody).toEqual({ tier: "professional" });
    expect(resp.data.url).toContain("stripe.com");
  });

  it("creates portal session", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/billing/portal-session`, () =>
        HttpResponse.json({ url: "https://billing.stripe.com/portal123" }),
      ),
    );

    const resp = await makeClient().billing.createPortal();
    expect(resp.data.url).toContain("stripe.com");
  });
});

// --- Teams ---

describe("teams", () => {
  it("gets current team", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/teams/me`, () =>
        HttpResponse.json({
          id: "t1", name: "My Team", tier: "professional",
          creditBalance: 5000, monthlyCredits: 10000,
        }),
      ),
    );

    const resp = await makeClient().teams.me();
    expect(resp.data.name).toBe("My Team");
    expect(resp.data.tier).toBe("professional");
  });

  it("lists team members", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/teams/me/members`, () =>
        HttpResponse.json([
          { id: "m1", email: "test@test.com", role: "admin" },
        ]),
      ),
    );

    const resp = await makeClient().teams.members();
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].role).toBe("admin");
  });

  it("invites a team member", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/teams/me/members`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "inv1", email: "new@test.com", role: "member", createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().teams.inviteMember({ email: "new@test.com", role: "member" });
    expect(capturedBody).toEqual({ email: "new@test.com", role: "member" });
    expect(resp.data.email).toBe("new@test.com");
  });

  it("removes a team member", async () => {
    server.use(
      http.delete(`${BASE_URL}/v1/teams/me/members/:id`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );

    const meta = await makeClient().teams.removeMember("m1");
    expect(meta).toBeDefined();
  });

  it("gets billing summary", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/teams/me/billing-summary`, () =>
        HttpResponse.json({
          tier: "professional", creditBalance: 5000,
          monthlyCredits: 10000, usedThisMonth: 3000, members: 5,
        }),
      ),
    );

    const resp = await makeClient().teams.billingSummary();
    expect(resp.data.members).toBe(5);
  });
});

// --- Analytics ---

describe("analytics", () => {
  it("gets canton distribution", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/analytics/cantons`, () =>
        HttpResponse.json([
          { canton: "ZH", count: 50000, percentage: 25.5 },
        ]),
      ),
    );

    const resp = await makeClient().analytics.cantons();
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].canton).toBe("ZH");
  });

  it("runs clustering", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/analytics/cluster`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          clusters: [{ id: 0, companyCount: 100 }],
        });
      }),
    );

    const resp = await makeClient().analytics.cluster({ algorithm: "kmeans", k: 5 });
    expect(capturedBody).toEqual({ algorithm: "kmeans", k: 5 });
    expect(resp.data.clusters).toHaveLength(1);
  });

  it("detects anomalies", async () => {
    server.use(
      http.post(`${BASE_URL}/v1/analytics/anomalies`, () =>
        HttpResponse.json({ anomalies: [], totalScanned: 1000, threshold: 0.95 }),
      ),
    );

    const resp = await makeClient().analytics.anomalies({ algorithm: "isolation_forest" });
    expect(resp.data.totalScanned).toBe(1000);
  });

  it("gets audit candidates", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/v1/analytics/candidates`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().analytics.candidates({ canton: "ZH", sortBy: "shareCapital" });
    const url = new URL(capturedUrl);
    expect(url.searchParams.get("canton")).toBe("ZH");
    expect(url.searchParams.get("sortBy")).toBe("shareCapital");
  });
});

// --- Graph ---

describe("graph", () => {
  it("gets company graph", async () => {
    server.use(
      http.get(`${BASE_URL}/v1/graph/:uid`, () =>
        HttpResponse.json({
          nodes: [{ id: "n1", name: "Test AG", nodeType: "company" }],
          links: [],
        }),
      ),
    );

    const resp = await makeClient().graph.get("CHE-123");
    expect(resp.data.nodes).toHaveLength(1);
    expect(resp.data.nodes[0].nodeType).toBe("company");
  });

  it("runs network analysis", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/v1/network/analyze`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          nodes: [], links: [], clusters: [],
        });
      }),
    );

    const resp = await makeClient().graph.analyze({
      uids: ["CHE-1", "CHE-2"], overlay: "board-members",
    });
    expect(capturedBody).toEqual({ uids: ["CHE-1", "CHE-2"], overlay: "board-members" });
    expect(resp.data.clusters).toHaveLength(0);
  });
});

// --- extractList utility ---

describe("extractList", () => {
  it("handles bare arrays", () => {
    const result = extractList<{ id: number }>([{ id: 1 }, { id: 2 }]);
    expect(result).toHaveLength(2);
  });

  it("extracts from data wrapper", () => {
    const result = extractList<{ id: number }>({ data: [{ id: 1 }] });
    expect(result).toHaveLength(1);
  });

  it("extracts from first array key", () => {
    const result = extractList<{ id: number }>({ items: [{ id: 1 }], total: 1 });
    expect(result).toHaveLength(1);
  });

  it("returns empty array for non-matching shapes", () => {
    expect(extractList("hello")).toEqual([]);
    expect(extractList(null)).toEqual([]);
    expect(extractList({ foo: "bar" })).toEqual([]);
  });
});
