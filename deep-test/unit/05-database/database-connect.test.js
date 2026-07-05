/**
 * Phase 5 — Database.collect() and connectDbs() wiring.
 * Real connections are exercised in the integration tier; here drivers are real
 * for collect() (no socket opened) and faked for connectDbs().
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import Database from "../../../src/package/framework/Database/Database.js";
import MongoDBDriver from "../../../src/package/framework/Database/drivers/mongodb.js";
const baseConfig = () => ({
    connections: {
        dev: { driver: "mongodb", url: "mongodb://host/", options: {} },
        test: { driver: "mongodb", url: "mongodb://host/" },
    },
    default: "test",
    bootWithDB: false,
    hideLogConnectionStrings: true,
});
describe("Database.collect", () => {
    it("builds a driver instance per connection and flags the default", async () => {
        const db = new Database(baseConfig());
        await db.collect(db.config.connections);
        expect(db.$databases.dev).toBeInstanceOf(MongoDBDriver);
        expect(db.$databases.test).toBeInstanceOf(MongoDBDriver);
        expect(db.$databases.test.isDefaultDB).toBe(true);
        expect(db.$databases.dev.isDefaultDB).toBe(false);
    });
});
describe("Database.connectDbs", () => {
    function fakeDb(config) {
        const db = new Database(config);
        // avoid the real terminal loading spinner / timers
        db.logLeft.loading = () => ({ start: vi.fn(), stop: vi.fn() });
        return db;
    }
    it("assigns each connection and aliases the default to '_'", async () => {
        const db = fakeDb({ default: "a", bootWithDB: false });
        db.$databases = {
            a: { connect: vi.fn(async () => ({ live: "a" })) },
            b: { connect: vi.fn(async () => ({ live: "b" })) },
        };
        await db.connectDbs();
        expect(db.$databases.a.connection).toEqual({ live: "a" });
        expect(db.$databases["_"]).toBe(db.$databases.a);
    });
    it("rethrows a connection error when bootWithDB is true", async () => {
        const db = fakeDb({ default: "a", bootWithDB: true });
        db.$databases = {
            a: { connect: vi.fn(async () => { throw new Error("down"); }) },
        };
        await expect(db.connectDbs()).rejects.toThrow("down");
    });
    it("tolerates a connection error when bootWithDB is false", async () => {
        const db = fakeDb({ default: "a", bootWithDB: false });
        db.$databases = {
            a: { connect: vi.fn(async () => { throw new Error("down"); }) },
        };
        await expect(db.connectDbs()).resolves.toBeUndefined();
    });
});
