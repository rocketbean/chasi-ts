/**
 * Phase 9 — CompilerEngine (Vite lib modules mocked).
 * setupEngines is a no-op under testMode (the framework never triggers a Vite
 * build during tests) and when disabled.
 */
import { describe, it, expect, vi } from "vitest";
vi.mock("../../../src/container/modules/compilerEngine/lib/Builder.js", () => ({ default: class Builder {
    } }));
vi.mock("../../../src/container/modules/compilerEngine/lib/devBundler.js", () => ({ default: {} }));
vi.mock("../../../src/container/modules/compilerEngine/lib/prodBundler.js", () => ({ default: {} }));
import "../../harness/globals.ts";
import CompilerEngine from "../../../src/container/modules/compilerEngine/compiler.js";
function make(cfg = { enabled: true, engines: [] }) {
    return new CompilerEngine(cfg);
}
describe("CompilerEngine", () => {
    it("registers itself as the static instance", () => {
        const c = make();
        expect(CompilerEngine.instance).toBe(c);
    });
    it("setInvoker stores the app reference", () => {
        const c = make();
        c.setInvoker({ marker: true });
        expect(c.$app).toEqual({ marker: true });
    });
    it("setupEngines is a no-op under testMode", async () => {
        const c = make({ enabled: true, engines: [{ name: "web" }] });
        await c.setupEngines();
        expect(c.builders).toEqual([]);
    });
    it("setupEngines is a no-op when disabled", async () => {
        const c = make({ enabled: false, engines: [{ name: "web" }] });
        await c.setupEngines();
        expect(c.builders).toEqual([]);
    });
    it("getStaticRenders exposes the assets mount", () => {
        const renders = make().getStaticRenders();
        expect(renders).toHaveLength(1);
        expect(renders[0].path).toBe("/assets/");
    });
    it("mount is a no-op when the engine is disabled", async () => {
        const c = make({ enabled: false, engines: [] });
        await expect(c.mount({ property: { prefix: "/" } }, ["web"])).resolves.toBeUndefined();
    });
});
