/**
 * Phase 5 — PrismaDriver. Base._fetchFile (the client loader) is spied so no real
 * Prisma client is required; live Prisma is integration tier.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import Base from "../../../src/package/Base.js";
import PrismaDriver from "../../../src/package/framework/Database/drivers/prisma.js";
// setModels() reads keys from _runtimeDataModel.models and looks up the same key
// on the client (this.driver[key]), storing it lowercased. Mirror that contract.
class FakePrismaClient {
    _runtimeDataModel = { models: { User: {}, Post: {} } };
    User = { findMany: vi.fn() };
    Post = { findMany: vi.fn() };
}
let spy;
beforeEach(() => {
    spy = vi.spyOn(Base, "_fetchFile").mockResolvedValue({ PrismaClient: FakePrismaClient });
});
afterEach(() => spy.mockRestore());
function makeDriver() {
    return new PrismaDriver({ url: "mysql://u:p@host/db", options: { client: "./prisma/client" } }, "mysql");
}
describe("PrismaDriver", () => {
    it("reports the prisma driverName and builds $property from config", () => {
        const d = makeDriver();
        expect(d.driverName).toBe("prisma");
        expect(d.$property.url).toBe("mysql://u:p@host/db");
        expect(d.hasOptions).toBe(true);
    });
    it("setModels lowercases model names from the runtime data model", async () => {
        const d = makeDriver();
        await d.getDriver("./prisma/client");
        d.setModels();
        expect(d.models.user).toBe(d.driver.User);
        expect(d.models.post).toBe(d.driver.Post);
    });
    it("connect loads the client, sets the connection and stops the loader", async () => {
        const d = makeDriver();
        const stop = vi.fn();
        const driver = await d.connect(stop);
        expect(driver).toBeInstanceOf(FakePrismaClient);
        expect(d.connection).toBe(driver);
        expect(stop).toHaveBeenCalled();
    });
});
