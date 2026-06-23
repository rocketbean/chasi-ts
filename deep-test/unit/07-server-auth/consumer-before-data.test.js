/**
 * Phase 7 — Consumer.consume(): before/after hooks, injected data(), return
 * serialization, and error formatting. Driven through a real (in-memory) express
 * app via supertest.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import "../../harness/globals.ts";
// Import App first: it initializes the App→Consumer→Handler import cycle in the
// order that resolves it (importing Consumer first throws "extends undefined").
import "../../../src/package/framework/Server/App.js";
import Consumer from "../../../src/package/framework/Server/Consumer.js";
import Endpoint from "../../../src/package/framework/Router/Endpoint.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
function makeEndpoint(method = "get", path = "/ping") {
    const ep = new Endpoint({ method, controller: () => { }, endpoint: path.slice(1), options: {} }, []);
    ep.path = path;
    ep.useAuth = (_q, _s, n) => n();
    ep.$middlewares = [];
    ep.isDynamic = false;
    ep.beforeFns = [];
    ep.afterFns = [];
    return ep;
}
beforeAll(async () => {
    await Exception.init({ emit: vi.fn() });
});
describe("Consumer.consume › happy path", () => {
    it("runs before/after hooks, exposes data(), and serializes the return value", async () => {
        const consumer = new Consumer({});
        const before = vi.fn();
        const after = vi.fn();
        const ep = makeEndpoint();
        ep.$controller = {};
        ep.$method = async (_req, _res, data) => ({ pong: true, injected: data() });
        ep.beforeFns = [before];
        ep.afterFns = [after];
        const router = { $registry: { routes: [ep] }, property: { data: () => ({ tenant: "acme" }) } };
        await consumer.consume(router);
        const res = await request(consumer.$server).get("/ping");
        expect(res.body).toEqual({ pong: true, injected: { tenant: "acme" } });
        expect(before).toHaveBeenCalledOnce();
        expect(after).toHaveBeenCalledOnce();
        // router data provider is injected onto the controller
        expect(ep.$controller.$data).toBe(router.property.data);
    });
});
describe("Consumer.consume › error formatting", () => {
    it("maps a thrown {status,message} to the response status and body", async () => {
        Consumer._defaultResponses = { 422: "default 422", message: "default" };
        const consumer = new Consumer({});
        const ep = makeEndpoint("get", "/boom");
        ep.$method = async () => {
            throw { status: 422, message: "explicit failure" };
        };
        const router = { $registry: { routes: [ep] }, property: {} };
        await consumer.consume(router);
        const res = await request(consumer.$server).get("/boom");
        expect(res.status).toBe(422);
        expect(res.text).toContain("explicit failure");
    });
});
describe("Consumer.bindModel", () => {
    it("binds a known model param to its document and nulls unknown ones", async () => {
        const consumer = new Consumer({});
        const Models = (await import("../../../src/package/framework/Database/Models.js")).default;
        Models.collection = { user: { findById: vi.fn(async (id) => ({ _id: id })) } };
        const params = { user: "42", widget: "9" };
        await consumer.bindModel(params);
        expect(params.__user).toEqual({ _id: "42" });
        expect(params.__widget).toBeNull();
    });
});
