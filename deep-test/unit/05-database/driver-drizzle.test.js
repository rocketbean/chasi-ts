/**
 * Phase 5 — DrizzleDriver. The drizzle() factory and schema loader are stubbed on
 * the instance so no real drizzle-orm adapter is imported (integration tier covers
 * the live adapters).
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import DrizzleDriver from "../../../src/package/framework/Database/drivers/drizzle.js";
function makeDriver(options) {
    return new DrizzleDriver({ url: "postgres://u:p@host/db", options, hideLogConnectionStrings: false }, "pg");
}
describe("DrizzleDriver", () => {
    it("reports the drizzle driverName", () => {
        expect(makeDriver({ adapter: "node-postgres" }).driverName).toBe("drizzle");
    });
    it("setModels exposes the query client as _db plus each table", () => {
        const d = makeDriver({ adapter: "node-postgres" });
        d.db = { __client: true };
        d.setModels({ users: { id: 1 }, posts: { id: 2 } });
        expect(d.models._db).toBe(d.db);
        expect(d.models.users).toEqual({ id: 1 });
        expect(d.models.posts).toEqual({ id: 2 });
    });
    it("connect forwards the url as `connection` and loads the schema", async () => {
        const d = makeDriver({ adapter: "node-postgres", schema: "./schema" });
        let captured;
        d.loadSchema = async () => ({ users: { id: 1 } });
        d.getDrizzleFn = async () => (cfg) => ((captured = cfg), { __db: true });
        const stop = vi.fn();
        const db = await d.connect(stop);
        expect(db).toEqual({ __db: true });
        expect(d.connection).toBe(db);
        expect(d.models._db).toBe(db);
        expect(d.models.users).toEqual({ id: 1 });
        expect(captured.connection).toBe("postgres://u:p@host/db");
        expect(captured.schema).toEqual({ users: { id: 1 } });
        expect(stop).toHaveBeenCalled();
    });
    it("connect omits `connection` when a pre-built globals.client is supplied", async () => {
        const d = makeDriver({ adapter: "mysql2", globals: { client: { __conn: true } } });
        let captured;
        d.loadSchema = async () => ({});
        d.getDrizzleFn = async () => (cfg) => ((captured = cfg), { __db: true });
        await d.connect(vi.fn());
        expect(captured.connection).toBeUndefined();
        expect(captured.client).toEqual({ __conn: true });
    });
});
