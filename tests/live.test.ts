/**
 * Live API smoke test — runs against the real VynCo API.
 * Requires API key passed via VYNCO_API_KEY env var.
 *
 * Usage: VYNCO_API_KEY=vc_live_xxx npx vitest run tests/live.test.ts
 */
import { describe, expect, it } from "vitest";
import { VyncoClient, ForbiddenError, AuthenticationError } from "../src/index.js";

const API_KEY = process.env.VYNCO_API_KEY ?? "";

// Skip all if no key
const describeIf = API_KEY ? describe : describe.skip;

function makeClient() {
  return new VyncoClient({ apiKey: API_KEY, maxRetries: 1 });
}

describeIf("live API smoke tests", () => {
  it("health check", async () => {
    const resp = await makeClient().health.check();
    expect(resp.data.status).toBeTruthy();
    console.log("  health:", resp.data.status, "version:", resp.data.version);
  });

  it("companies.list", async () => {
    const resp = await makeClient().companies.list({ canton: "ZH", pageSize: 3 });
    expect(resp.data.items.length).toBeGreaterThan(0);
    expect(resp.data.total).toBeGreaterThan(0);
    console.log(`  companies: ${resp.data.total} in ZH, first: ${resp.data.items[0].name}`);
  });

  it("companies.count", async () => {
    const resp = await makeClient().companies.count();
    expect(resp.data.count).toBeGreaterThan(100000);
    console.log(`  total companies: ${resp.data.count}`);
  });

  it("companies.get", async () => {
    const resp = await makeClient().companies.get("CHE-105.805.649");
    expect(resp.data.uid).toBe("CHE-105.805.649");
    expect(resp.data.name).toBeTruthy();
    console.log(`  company: ${resp.data.name} (${resp.data.canton})`);
  });

  it("companies.fingerprint", async () => {
    const resp = await makeClient().companies.fingerprint("CHE-105.805.649");
    expect(resp.data.companyUid).toBe("CHE-105.805.649");
    expect(resp.data.boardSize).toBeGreaterThan(0);
    console.log(`  fingerprint: boardSize=${resp.data.boardSize}, age=${resp.data.companyAge}`);
  });

  it("credits.balance (may 401 if key lacks scope)", async () => {
    try {
      const resp = await makeClient().credits.balance();
      expect(resp.data.tier).toBeTruthy();
      console.log(`  credits: balance=${resp.data.balance}, tier=${resp.data.tier}`);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        console.log("  credits.balance: 401 (key lacks credits scope — OK)");
      } else {
        throw err;
      }
    }
  });

  it("persons.boardMembers", async () => {
    const resp = await makeClient().persons.boardMembers("CHE-105.805.649");
    expect(resp.data.length).toBeGreaterThan(0);
    console.log(`  board members: ${resp.data.length}, first: ${resp.data[0].firstName} ${resp.data[0].lastName}`);
  });

  it("response metadata is present", async () => {
    const resp = await makeClient().companies.count();
    expect(resp.meta.requestId).toBeTruthy();
    console.log(`  requestId: ${resp.meta.requestId}, creditsUsed: ${resp.meta.creditsUsed}`);
  });
});
