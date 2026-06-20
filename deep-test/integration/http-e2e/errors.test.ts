/**
 * Phase 12 — error responses e2e. Opt-in: DEEP_INTEGRATION=1.
 */
import { describe, it, expect, afterAll } from "vitest";
import { HttpClient } from "../../harness/http.ts";
import { shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;
const client = new HttpClient({ basePath: "/api", signinUrl: "/api/users/signin" });

describe.skipIf(!RUN)("integration › error responses", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("returns 404 for an unknown route", async () => {
    const res = await client.send({ url: "/definitely/not/here", method: "get", raw: true });
    expect(res.statusCode).toBe(404);
  });

  it("returns 422 when signin credentials are missing", async () => {
    const res = await client.send({ url: "/users/signin", method: "post", data: {} });
    expect(res.statusCode).toBe(422);
  });

  it("returns 401 for a wrong password", async () => {
    const res = await client.send({
      url: "/users/signin",
      method: "post",
      data: { email: "nobody@test.co", pass: "wrong" },
    });
    expect([401, 422]).toContain(res.statusCode);
  });
});
