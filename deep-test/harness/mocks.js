/**
 * Shared mock factories for the UNIT tier (mock-first strategy).
 *
 * These let unit tests exercise framework logic (routing, controllers,
 * middleware, error formatting, service lifecycle) WITHOUT real DB, HTTP,
 * or socket infrastructure. Keep these dumb and explicit — a test should be
 * able to read exactly what behavior it relies on.
 *
 * NOTE: signatures here are scaffolding stubs. Tighten them per subsystem as
 * each phase is implemented (see deep-test/PLAN.md).
 */
import { vi } from "vitest";
/** Minimal Express-like request. */
export function mockRequest(overrides = {}) {
    return {
        method: "GET",
        url: "/",
        headers: {},
        params: {},
        query: {},
        body: {},
        auth: undefined,
        get(name) {
            return this.headers[name?.toLowerCase?.()];
        },
        ...overrides,
    };
}
/** Minimal Express-like response with sp[ied chainable methods. */
export function mockResponse() {
    const res = {};
    res.statusCode = 200;
    res.headers = {};
    res.status = vi.fn((code) => ((res.statusCode = code), res));
    res.set = vi.fn((k, v) => ((res.headers[k] = v), res));
    res.json = vi.fn((body) => ((res.body = body), res));
    res.send = vi.fn((body) => ((res.body = body), res));
    res.end = vi.fn(() => res);
    return res;
}
/** next() spy for middleware tests. */
export function mockNext() {
    return vi.fn();
}
/** A fake Mongoose-style model with the subset of methods controllers use. */
export function mockMongooseModel(seed = []) {
    const store = [...seed];
    return {
        __store: store,
        find: vi.fn(async (q = {}) => store),
        findOne: vi.fn(async (q = {}) => store.find((d) => Object.entries(q).every(([k, v]) => d[k] === v)) ?? null),
        findById: vi.fn(async (id) => store.find((d) => d._id === id || d.id === id) ?? null),
        create: vi.fn(async (doc) => {
            const created = { _id: `mock-${store.length + 1}`, ...doc };
            store.push(created);
            return created;
        }),
        deleteOne: vi.fn(async () => ({ acknowledged: true, deletedCount: 1 })),
    };
}
/** A fake Drizzle query builder (select().from() chain). */
export function mockDrizzle(rows = []) {
    const chain = {
        select: vi.fn(() => chain),
        from: vi.fn(async () => rows),
        insert: vi.fn(() => chain),
        values: vi.fn(async () => ({ rowCount: 1 })),
        where: vi.fn(() => chain),
    };
    return chain;
}
/** A fake WebSocket-ish socket for NetServer/StreamBucket unit tests. */
export function mockSocket() {
    return {
        send: vi.fn(),
        close: vi.fn(),
        on: vi.fn(),
        readyState: 1,
        __sent: [],
    };
}
