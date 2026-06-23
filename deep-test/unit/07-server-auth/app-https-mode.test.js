/**
 * Phase 7 — App https mode credential loading failures.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import App from "../../../src/package/framework/Server/App.js";
function makeHttpsApp(dev) {
    const config = {
        port: 3099,
        environment: "dev",
        modes: { dev, local: { protocol: "http", key: null, cert: null } },
        cors: { origin: "*" },
    };
    return new App(config, { full: { write() { } }, EndTraceFull: { write() { } } });
}
describe("App › https credential loading", () => {
    it("throws a clear error when key/cert are not configured", async () => {
        const app = makeHttpsApp({ protocol: "https", key: null, cert: null });
        await expect(app.install()).rejects.toThrow(/Missing HTTPS/);
    });
    it("throws when the configured cert/key files cannot be read", async () => {
        const app = makeHttpsApp({
            protocol: "https",
            key: "/nonexistent/key.pem",
            cert: "/nonexistent/cert.pem",
        });
        await expect(app.install()).rejects.toThrow(/Unable to load HTTPS/);
    });
});
