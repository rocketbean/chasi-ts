/**
 * Phase 2 — config/compiler.ts.
 *
 * The config statically imports `Builder` from the compilerEngine module (which
 * pulls in Vite via dev/prod bundlers). We mock that module so the test stays in
 * the unit tier. `environment` is hardcoded to "prod" in 4.1.2 (not env-driven),
 * so there is no env permutation here.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
vi.mock("../../../src/container/modules/compilerEngine/compiler.js", () => ({
    Builder: { distribute: vi.fn(), prodSetup: vi.fn() },
    default: {},
}));
import compiler from "../../../src/config/compiler.js";
import { Builder } from "../../../src/container/modules/compilerEngine/compiler.js";
describe("config/compiler", () => {
    it("is enabled with a single 'web' engine", () => {
        expect(compiler.enabled).toBe(true);
        expect(Array.isArray(compiler.engines)).toBe(true);
        expect(compiler.engines).toHaveLength(1);
        expect(compiler.engines[0].name).toBe("web");
    });
    it("the web engine targets prod with SSR entry and mount", () => {
        const eng = compiler.engines[0];
        expect(eng.environment).toBe("prod");
        expect(eng.ssrServerModule).toBe("entry-server.js");
        expect(eng.mountedTo).toBe("/");
        expect(eng.serverBuild).toMatchObject({ outDir: "./.out/server", ssr: "./entry-server.js" });
        expect(eng.clientBuild).toMatchObject({ outDir: "./.out/client", manifest: true });
    });
    it("the engine hook runs Builder.distribute then Builder.prodSetup in prod", async () => {
        const eng = compiler.engines[0];
        const getConfig = vi.fn();
        const ctx = { root: "/project/web" };
        await eng.hook(getConfig, ctx);
        expect(Builder.distribute).toHaveBeenCalledWith("/project/web");
        expect(Builder.prodSetup).toHaveBeenCalledWith(getConfig, ctx);
    });
});
