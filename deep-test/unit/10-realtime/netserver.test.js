/**
 * Phase 10 — NetServer router registry + pipe fan-out (live ws is integration tier).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import "../../harness/globals.ts";
import NetServer from "../../../src/container/modules/SocketServer/NetServer.js";
import SocketRouter from "../../../src/container/modules/SocketServer/lib/SocketRouter.js";
beforeEach(() => {
    NetServer.$routers = {};
});
describe("NetServer registry", () => {
    it("registers and exposes socket routers by path", () => {
        const router = { emit: vi.fn() };
        NetServer.register("/web", router);
        expect(new NetServer().routers["/web"]).toBe(router);
    });
    it("wires the observer onto SocketRouter without a pipe", () => {
        const observer = { tag: "obs" };
        new NetServer(undefined, observer);
        expect(SocketRouter.$observer).toBe(observer);
    });
});
describe("NetServer pipe fan-out", () => {
    it("forwards socket:fire pipe messages to the target router", () => {
        const router = { emit: vi.fn() };
        NetServer.register("/p", router);
        const pipe = new EventEmitter();
        new NetServer(pipe, {});
        pipe.emit("socket:fire", { transmit: { path: "/p", event: "ping", payload: { a: 1 } } });
        expect(router.emit).toHaveBeenCalledWith("ping", { a: 1 });
    });
});
