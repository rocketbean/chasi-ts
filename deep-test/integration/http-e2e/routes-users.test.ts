/**
 * Phase 12 — user route e2e (signup/signin). Opt-in: DEEP_INTEGRATION=1.
 * The bundled demo api exposes /api/users/signup and /api/users/signin.
 */
import { describe, it, expect, afterAll } from "vitest";
import { HttpClient } from "../../harness/http.ts";
import { shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;
const client = new HttpClient({ basePath: "/api", signinUrl: "/api/users/signin" });
const stamp = Date.now();
const user = { name: "Deep", alias: `deep${stamp}`, email: `deep${stamp}@test.co`, password: "secret1" };

describe.skipIf(!RUN)("integration › user routes", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("signs up a new user", async () => {
    const res = await client.send({ url: "/users/signup", method: "post", data: user });
    expect([200, 201]).toContain(res.statusCode);
  });

  it("rejects a duplicate signup with 400", async () => {
    const res = await client.send({ url: "/users/signup", method: "post", data: user });
    expect(res.statusCode).toBe(400);
  });

  it("signs in with valid credentials and returns a token", async () => {
    const res = await client.send({
      url: "/users/signin",
      method: "post",
      data: { email: user.email, pass: user.password },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });
});
