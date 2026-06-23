/**
 * Phase 7 — JWTDriver.authorize() sign/verify round-trip and failure modes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import "../../harness/globals.ts";
import JWTDriver from "../../../src/package/framework/Server/AuthDrivers/jwt.js";
import Models from "../../../src/package/framework/Database/Models.js";
const KEY = "phase7-secret";
const ep = { path: "/me", property: { method: "get" } };
function makeReqRes(token) {
    const req = {
        header: (n) => (n === "Authorization" && token ? `Bearer ${token}` : undefined),
    };
    const res = { status: vi.fn(() => res), send: vi.fn(() => res) };
    return { req, res };
}
beforeEach(() => {
    Models.collection = { user: { findOne: vi.fn(async () => ({ _id: "1", name: "Al" })) } };
});
describe("JWTDriver.authorize", () => {
    it("verifies a valid token and populates request.auth", async () => {
        const driver = new JWTDriver({ key: KEY, model: "user", AuthRouteExceptions: [] });
        const token = jwt.sign({ _id: "1" }, KEY);
        const { req, res } = makeReqRes(token);
        const next = vi.fn();
        await driver.authorize(ep, [])(req, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(req.auth).toEqual({ user: { _id: "1", name: "Al" }, _t: token });
        expect(res.status).not.toHaveBeenCalled();
    });
    it("responds 401 for an invalid token", async () => {
        const driver = new JWTDriver({ key: KEY, model: "user", AuthRouteExceptions: [] });
        const { req, res } = makeReqRes("garbage.token");
        const next = vi.fn();
        await driver.authorize(ep, [])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
    it("responds 401 when no token is supplied", async () => {
        const driver = new JWTDriver({ key: KEY, model: "user", AuthRouteExceptions: [] });
        const { req, res } = makeReqRes(undefined);
        const next = vi.fn();
        await driver.authorize(ep, [])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
