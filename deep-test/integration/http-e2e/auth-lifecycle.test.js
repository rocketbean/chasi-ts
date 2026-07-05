/**
 * Phase 12 — auth lifecycle e2e (signup → signin → token capture).
 * Opt-in: DEEP_INTEGRATION=1.
 */
import { describe, it, expect, afterAll } from "vitest";
import { HttpClient } from "../../harness/http.ts";
import { shutdown } from "../../harness/app.ts";
const RUN = !!process.env.DEEP_INTEGRATION;
const client = new HttpClient({ basePath: "/api", signinUrl: "/api/users/signin" });
const stamp = Date.now();
const user = { name: "Auth", alias: `auth${stamp}`, email: `auth${stamp}@test.co`, password: "secret1" };
describe.skipIf(!RUN)("integration › auth lifecycle", () => {
    afterAll(async () => {
        await shutdown();
    });
    it("captures a token via the HttpClient.authenticate flow", async () => {
        await client.send({ url: "/users/signup", method: "post", data: user });
        const auth = await client.authenticate({ email: user.email, pass: user.password });
        expect(auth.token).toBeDefined();
        expect(client.token).toBeTruthy();
    });
});
