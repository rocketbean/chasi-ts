/**
 * Phase 8 — RouterServiceProvider boot() routers + beforeRoute() middleware.
 * The compilerEngine module is mocked to avoid pulling Vite.
 */
import { describe, it, expect, vi } from "vitest";
vi.mock("../../../src/container/modules/compilerEngine/compiler.js", () => ({
    default: class CompilerEngine {
        static instance = { mount: vi.fn() };
    },
}));
import "../../harness/globals.ts";
import RouterServiceProvider from "../../../src/container/services/RouterServiceProvider.js";
import Provider from "../../../src/package/framework/Services/Provider.js";
describe("RouterServiceProvider.boot", () => {
    it("returns the api and chasi routers", async () => {
        const routers = (await new RouterServiceProvider().boot());
        expect(routers).toHaveLength(2);
        expect(routers[0].property.name).toBe("api");
        expect(routers[0].property.prefix).toBe("/api");
        expect(routers[0].property.auth).toBe("dev");
        expect(routers[1].property.name).toBe("chasi");
        expect(routers[1].property.auth).toBe(false);
    });
    it("declares signin/signup as auth route exceptions on the api router", async () => {
        const routers = (await new RouterServiceProvider().boot());
        expect(routers[0].property.AuthRouteExceptions).toEqual([
            { m: "post", url: "/api/users/signin" },
            { m: "post", url: "/api/users/signup" },
        ]);
    });
});
describe("RouterServiceProvider.beforeRoute", () => {
    it("attaches cors, json body parser and static serving to the app", async () => {
        Provider.config = { server: { cors: { origin: "*" } } };
        const $app = { use: vi.fn() };
        await new RouterServiceProvider().beforeRoute($app);
        expect($app.use).toHaveBeenCalledTimes(3);
    });
});
