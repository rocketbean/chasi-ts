/**
 * Phase 5 — driver registry (Database.$drivers) + per-driver identity.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import Database from "../../../src/package/framework/Database/Database.js";
import MongoDBDriver from "../../../src/package/framework/Database/drivers/mongodb.js";
import DrizzleDriver from "../../../src/package/framework/Database/drivers/drizzle.js";
import PrismaDriver from "../../../src/package/framework/Database/drivers/prisma.js";
function makeDb(config = { connections: {}, default: "_", hideLogConnectionStrings: false }) {
    return new Database(config);
}
describe("Database.$drivers", () => {
    it("resolves mongodb/prisma/drizzle to their driver classes", () => {
        const db = makeDb();
        expect(db.$drivers.mongodb).toBe(MongoDBDriver);
        expect(db.$drivers.prisma).toBe(PrismaDriver);
        expect(db.$drivers.drizzle).toBe(DrizzleDriver);
    });
    it("each driver reports its own driverName", () => {
        expect(new MongoDBDriver({ url: "mongodb://h/", options: {} }, "m").driverName).toBe("mongodb");
        expect(new DrizzleDriver({ url: "x", options: { adapter: "node-postgres" } }, "d").driverName).toBe("drizzle");
    });
    it("collect() throws for an unknown driver name", async () => {
        const db = makeDb({
            connections: { x: { driver: "nope", url: "u" } },
            default: "x",
            hideLogConnectionStrings: false,
        });
        await expect(db.collect({ x: { driver: "nope", url: "u" } })).rejects.toBeInstanceOf(TypeError);
    });
});
