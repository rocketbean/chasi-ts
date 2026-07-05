/**
 * Phase 1 — Base (src/package/Base.ts): the config-loading helper used by boot.
 *
 * Covers:
 *   - Base.mergeObjects (lodash deep merge, mutates target)
 *   - ProxyHandler (the accessor Handler.$proxy uses to guard internals)
 *   - Base.Ignition() — loads every file in src/config and returns a registry
 *     keyed by config name.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";
import Base, { ProxyHandler } from "../../../src/package/Base.js";
describe("Base › mergeObjects", () => {
    beforeAll(async () => {
        await ready;
    });
    it("merges shallow keys", () => {
        expect(Base.mergeObjects({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });
    it("deep-merges nested structures", () => {
        const merged = Base.mergeObjects({ a: { x: 1 } }, { a: { y: 2 } });
        expect(merged).toEqual({ a: { x: 1, y: 2 } });
    });
    it("mutates and returns the target", () => {
        const target = { a: 1 };
        const result = Base.mergeObjects(target, { b: 2 });
        expect(result).toBe(target);
        expect(target).toEqual({ a: 1, b: 2 });
    });
});
describe("Base › ProxyHandler", () => {
    it("returns plain values for accessible keys", () => {
        const proxied = new Proxy({ name: "chasi", count: 3 }, ProxyHandler);
        expect(proxied.name).toBe("chasi");
        expect(proxied.count).toBe(3);
    });
    it("binds functions to the target", () => {
        const target = {
            value: 7,
            getValue() {
                return this.value;
            },
        };
        const proxied = new Proxy(target, ProxyHandler);
        const fn = proxied.getValue; // detached
        expect(fn()).toBe(7); // still bound to target
    });
    it("throws when accessing a missing key", () => {
        const proxied = new Proxy({ a: 1 }, ProxyHandler);
        expect(() => proxied.nope).toThrow(/not accessible/);
    });
    it("throws when accessing an underscore-prefixed (internal) key", () => {
        const proxied = new Proxy({ _secret: 1 }, ProxyHandler);
        expect(() => proxied._secret).toThrow(/not accessible/);
    });
});
describe("Base › Ignition", () => {
    beforeAll(async () => {
        await ready;
    });
    it("loads the config directory into a registry object", async () => {
        const registry = await Base.Ignition();
        expect(registry).toBeTypeOf("object");
        // Per-file import errors are swallowed (key present, value possibly undefined),
        // so every config filename should appear as a key.
        expect(Object.keys(registry)).toEqual(expect.arrayContaining(["server", "database", "authentication"]));
    });
});
