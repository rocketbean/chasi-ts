/**
 * Phase 6 — UserController happy paths against a mocked user model.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import UserController from "../../../src/container/controllers/v1/UserController.js";
import Models from "../../../src/package/framework/Database/Models.js";
function makeUC(user) {
    Models.collection = { user };
    return new UserController();
}
describe("UserController", () => {
    it("create() inserts when the email is free", async () => {
        const user = {
            findOne: vi.fn(async () => null),
            create: vi.fn(async (d) => ({ _id: "1", ...d })),
        };
        const uc = makeUC(user);
        const out = await uc.create({ body: { email: "a@b.c", name: "Al" } }, {});
        expect(user.create).toHaveBeenCalledWith({ email: "a@b.c", name: "Al" });
        expect(out).toMatchObject({ _id: "1", email: "a@b.c" });
    });
    it("index() looks up by the user path param", async () => {
        const user = { findOne: vi.fn(async () => ({ _id: "42" })) };
        const uc = makeUC(user);
        await uc.index({ params: { user: "42" } }, {});
        expect(user.findOne).toHaveBeenCalledWith({ id: "42" });
    });
    it("list() returns all users", async () => {
        const rows = [{ _id: "1" }, { _id: "2" }];
        const user = { find: vi.fn(async () => rows) };
        const uc = makeUC(user);
        expect(await uc.list({}, {})).toBe(rows);
    });
    it("signin() returns the user and a freshly generated token", async () => {
        const userDoc = { generateAuthToken: vi.fn(async () => "jwt-token") };
        const user = { findByCredentials: vi.fn(async () => userDoc) };
        const uc = makeUC(user);
        const out = await uc.signin({ body: { email: "a@b.c", pass: "pw" } }, {});
        expect(user.findByCredentials).toHaveBeenCalledWith("a@b.c", "pw");
        expect(userDoc.generateAuthToken).toHaveBeenCalledWith("dev");
        expect(out).toEqual({ user: userDoc, token: "jwt-token" });
    });
});
