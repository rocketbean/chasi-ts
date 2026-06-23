/**
 * Phase 6 — statics/Controller dependency injection getters.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Controller from "../../../src/package/statics/Controller.js";
import BaseController from "../../../src/package/framework/Router/Controller.js";
import Models from "../../../src/package/framework/Database/Models.js";
beforeAll(() => {
    BaseController.$compiler = { engine: "web" };
    BaseController.init({ routers: { r: 1 }, sockets: { s: 2 } });
    globalThis.$app = { $observer: { tag: "observer" } };
    Models.collection = { user: { find: () => { } } };
});
describe("Controller injection", () => {
    it("exposes the registered services", () => {
        expect(new Controller().services).toEqual({ routers: { r: 1 }, sockets: { s: 2 } });
    });
    it("exposes the model collection", () => {
        expect(new Controller().models).toBe(Models.collection);
    });
    it("exposes the compiler", () => {
        expect(new Controller().compiler).toEqual({ engine: "web" });
    });
    it("exposes the global observer", () => {
        expect(new Controller().$observer).toEqual({ tag: "observer" });
    });
});
