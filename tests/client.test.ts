import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigError,
  ForbiddenError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  VyncoClient,
  extractList,
} from "../src/index.js";

const BASE_URL = "https://test.api.vynco.ch/v1";
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
      baseUrl: "https://test.api.vynco.ch/v1///",
      maxRetries: 0,
    });

    server.use(
      http.get("https://test.api.vynco.ch/v1/credits/balance", () =>
        HttpResponse.json({ balance: 100, monthlyCredits: 500, usedThisMonth: 50, tier: "starter", overageRate: 0.01 }),
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
      http.get(`${BASE_URL}/auth/me`, ({ request }) => {
        capturedAuth = request.headers.get("authorization") ?? "";
        return HttpResponse.json({ id: "u1", name: "Test", email: "t@t.com", avatar: "", plan: "free", creditBalance: 0 });
      }),
    );

    await makeClient().users.me();
    expect(capturedAuth).toBe(`Bearer ${API_KEY}`);
  });
});

// --- Error Mapping ---

describe("error mapping", () => {
  const errorBody = { detail: "test error", message: "test error", status: 0 };

  it("maps 401 to AuthenticationError", async () => {
    server.use(
      http.get(`${BASE_URL}/auth/me`, () =>
        HttpResponse.json({ ...errorBody, status: 401 }, { status: 401 }),
      ),
    );

    await expect(makeClient().users.me()).rejects.toThrow(AuthenticationError);
  });

  it("maps 402 to InsufficientCreditsError", async () => {
    server.use(
      http.get(`${BASE_URL}/credits/balance`, () =>
        HttpResponse.json({ ...errorBody, status: 402 }, { status: 402 }),
      ),
    );

    await expect(makeClient().credits.balance()).rejects.toThrow(InsufficientCreditsError);
  });

  it("maps 403 to ForbiddenError", async () => {
    server.use(
      http.get(`${BASE_URL}/auth/me`, () =>
        HttpResponse.json({ ...errorBody, status: 403 }, { status: 403 }),
      ),
    );

    await expect(makeClient().users.me()).rejects.toThrow(ForbiddenError);
  });

  it("maps 404 to NotFoundError", async () => {
    server.use(
      http.get(`${BASE_URL}/companies/:uid`, () =>
        HttpResponse.json({ ...errorBody, status: 404 }, { status: 404 }),
      ),
    );

    await expect(makeClient().companies.get("CHE-000")).rejects.toThrow(NotFoundError);
  });

  it("maps 400 to ValidationError", async () => {
    server.use(
      http.post(`${BASE_URL}/api-keys`, () =>
        HttpResponse.json({ ...errorBody, status: 400 }, { status: 400 }),
      ),
    );

    await expect(
      makeClient().apiKeys.create({ name: "", isTest: true, permissions: [] }),
    ).rejects.toThrow(ValidationError);
  });

  it("maps 422 to ValidationError", async () => {
    server.use(
      http.post(`${BASE_URL}/api-keys`, () =>
        HttpResponse.json({ ...errorBody, status: 422 }, { status: 422 }),
      ),
    );

    await expect(
      makeClient().apiKeys.create({ name: "x", isTest: true, permissions: [] }),
    ).rejects.toThrow(ValidationError);
  });

  it("maps 429 to RateLimitError", async () => {
    server.use(
      http.get(`${BASE_URL}/auth/me`, () =>
        HttpResponse.json({ ...errorBody, status: 429 }, { status: 429 }),
      ),
    );

    await expect(makeClient().users.me()).rejects.toThrow(RateLimitError);
  });

  it("maps 500 to ServerError", async () => {
    server.use(
      http.get(`${BASE_URL}/auth/me`, () =>
        HttpResponse.json({ ...errorBody, status: 500 }, { status: 500 }),
      ),
    );

    await expect(makeClient().users.me()).rejects.toThrow(ServerError);
  });

  it("maps 503 to ServerError", async () => {
    server.use(
      http.get(`${BASE_URL}/auth/me`, () =>
        HttpResponse.json({ ...errorBody, status: 503 }, { status: 503 }),
      ),
    );

    await expect(makeClient().users.me()).rejects.toThrow(ServerError);
  });
});

// --- Response Metadata ---

describe("response metadata", () => {
  it("parses all metadata headers", async () => {
    server.use(
      http.get(`${BASE_URL}/credits/balance`, () =>
        HttpResponse.json(
          { balance: 100, monthlyCredits: 500, usedThisMonth: 50, tier: "starter", overageRate: 0.01 },
          {
            headers: {
              "x-request-id": "req-123",
              "x-credits-used": "5",
              "x-credits-remaining": "95",
              "x-rate-limit-limit": "60",
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
    expect(resp.meta.dataSource).toBe("zefix");
  });

  it("handles missing metadata headers gracefully", async () => {
    server.use(
      http.get(`${BASE_URL}/credits/balance`, () =>
        HttpResponse.json({ balance: 0, monthlyCredits: 0, usedThisMonth: 0, tier: "", overageRate: 0 }),
      ),
    );

    const resp = await makeClient().credits.balance();
    expect(resp.meta.requestId).toBeUndefined();
    expect(resp.meta.creditsUsed).toBeUndefined();
  });
});

// --- Companies Resource ---

describe("companies", () => {
  it("searches with query params", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/companies`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().companies.search({ search: "Nestlé", canton: "VD", page: 1, pageSize: 20 });

    const url = new URL(capturedUrl);
    expect(url.searchParams.get("search")).toBe("Nestlé");
    expect(url.searchParams.get("canton")).toBe("VD");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("pageSize")).toBe("20");
  });

  it("gets company by UID", async () => {
    server.use(
      http.get(`${BASE_URL}/companies/:uid`, ({ params }) =>
        HttpResponse.json({
          uid: params.uid,
          name: "Test AG",
          legalSeat: "Zürich",
          canton: "ZH",
          legalForm: "AG",
          status: "active",
          purpose: "Testing",
          dataSource: "zefix",
          lastModified: "2026-01-01",
        }),
      ),
    );

    const resp = await makeClient().companies.get("CHE-123.456.789");
    expect(resp.data.uid).toBe("CHE-123.456.789");
    expect(resp.data.name).toBe("Test AG");
  });

  it("gets company count", async () => {
    server.use(
      http.get(`${BASE_URL}/companies/count`, () =>
        HttpResponse.json({ count: 42 }),
      ),
    );

    const resp = await makeClient().companies.count();
    expect(resp.data.count).toBe(42);
  });

  it("gets changes for a company", async () => {
    server.use(
      http.get(`${BASE_URL}/companies/:uid/changes`, () =>
        HttpResponse.json([
          { id: "c1", companyUid: "CHE-123", changeType: "update", fieldName: "name", oldValue: "Old", newValue: "New", detectedAt: "2026-01-01" },
        ]),
      ),
    );

    const resp = await makeClient().companies.changes("CHE-123");
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].fieldName).toBe("name");
  });

  it("gets persons for a company", async () => {
    server.use(
      http.get(`${BASE_URL}/companies/:uid/persons`, () =>
        HttpResponse.json([
          { personId: "p1", firstName: "Hans", lastName: "Müller", role: "Director" },
        ]),
      ),
    );

    const resp = await makeClient().companies.persons("CHE-123");
    expect(resp.data).toHaveLength(1);
    expect(resp.data[0].lastName).toBe("Müller");
  });

  it("compares companies via POST", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/companies/compare`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          companies: [],
          dimensions: ["capital"],
          similarities: ["same canton"],
          differences: ["different capital"],
        });
      }),
    );

    const resp = await makeClient().companies.compare(["CHE-1", "CHE-2"]);
    expect(capturedBody).toEqual({ uids: ["CHE-1", "CHE-2"] });
    expect(resp.data.dimensions).toContain("capital");
  });
});

// --- Credits Resource ---

describe("credits", () => {
  it("gets credit balance", async () => {
    server.use(
      http.get(`${BASE_URL}/credits/balance`, () =>
        HttpResponse.json({ balance: 1000, monthlyCredits: 2000, usedThisMonth: 500, tier: "professional", overageRate: 0.005 }),
      ),
    );

    const resp = await makeClient().credits.balance();
    expect(resp.data.balance).toBe(1000);
    expect(resp.data.tier).toBe("professional");
  });

  it("gets usage with since parameter", async () => {
    let capturedUrl = "";

    server.use(
      http.get(`${BASE_URL}/credits/usage`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ operations: [], totalDebited: 0 });
      }),
    );

    await makeClient().credits.usage("2026-01-01");
    expect(new URL(capturedUrl).searchParams.get("since")).toBe("2026-01-01");
  });
});

// --- API Keys Resource ---

describe("api keys", () => {
  it("creates an API key", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/api-keys`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "k1",
          name: "test-key",
          rawKey: "vc_test_raw123",
          keyPrefix: "vc_test_",
          permissions: ["read"],
          createdAt: "2026-01-01",
        });
      }),
    );

    const resp = await makeClient().apiKeys.create({
      name: "test-key",
      isTest: true,
      permissions: ["read"],
    });

    expect(capturedBody).toEqual({ name: "test-key", isTest: true, permissions: ["read"] });
    expect(resp.data.rawKey).toBe("vc_test_raw123");
  });

  it("revokes an API key and returns metadata only", async () => {
    server.use(
      http.delete(`${BASE_URL}/api-keys/:id`, () =>
        new HttpResponse(null, {
          status: 204,
          headers: { "x-request-id": "req-del" },
        }),
      ),
    );

    const meta = await makeClient().apiKeys.revoke("k1");
    expect(meta.requestId).toBe("req-del");
  });
});

// --- Teams Resource ---

describe("teams", () => {
  it("gets current team", async () => {
    server.use(
      http.get(`${BASE_URL}/teams/me`, () =>
        HttpResponse.json({
          id: "t1",
          name: "My Team",
          slug: "my-team",
          tier: "professional",
          creditBalance: 5000,
          monthlyCredits: 10000,
          overageRate: 0.01,
          createdAt: "2026-01-01",
        }),
      ),
    );

    const resp = await makeClient().teams.me();
    expect(resp.data.name).toBe("My Team");
    expect(resp.data.tier).toBe("professional");
  });
});

// --- Dossiers Resource ---

describe("dossiers", () => {
  it("generates a dossier with uid merged into body", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(`${BASE_URL}/dossiers`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          id: "d1",
          companyUid: "CHE-123",
          status: "completed",
          executiveSummary: "A great company",
          keyInsights: ["insight1"],
          riskFactors: [],
        });
      }),
    );

    const resp = await makeClient().dossiers.generate("CHE-123", {
      level: "standard",
    });

    expect(capturedBody).toEqual({ uid: "CHE-123", level: "standard" });
    expect(resp.data.executiveSummary).toBe("A great company");
  });
});

// --- Webhooks Resource ---

describe("webhooks", () => {
  it("creates a webhook", async () => {
    server.use(
      http.post(`${BASE_URL}/webhooks`, () =>
        HttpResponse.json({
          id: "wh1",
          url: "https://example.com/hook",
          events: ["company.changed"],
          secret: "whsec_123",
        }),
      ),
    );

    const resp = await makeClient().webhooks.create({
      url: "https://example.com/hook",
      events: ["company.changed"],
    });

    expect(resp.data.secret).toBe("whsec_123");
  });

  it("deletes a webhook", async () => {
    server.use(
      http.delete(`${BASE_URL}/webhooks/:id`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );

    const meta = await makeClient().webhooks.delete("wh1");
    expect(meta).toBeDefined();
  });
});

// --- Persons Resource ---

describe("persons", () => {
  it("searches persons by name", async () => {
    server.use(
      http.post(`${BASE_URL}/persons/search`, () =>
        HttpResponse.json([
          { id: "p1", firstName: "Hans", lastName: "Müller", roles: [] },
        ]),
      ),
    );

    const resp = await makeClient().persons.search({ name: "Müller" });
    expect(resp.data).toHaveLength(1);
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
