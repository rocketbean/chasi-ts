/**
 * Phase 1 — Logger (src/package/Logger/**).
 *
 * Logger.init() is a singleton that instantiates one writer per type exported
 * from Logger/types/writers.ts. In the unit tier Writer.log defaults to a no-op,
 * so rendering produces no output but must still not throw for any writer type.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";
import Logger from "../../../src/package/Logger/index.js";
import Writer from "../../../src/package/Logger/types/Writer.js";
const WRITER_TYPES = [
    "Center",
    "Full",
    "StartTrace",
    "EndTrace",
    "EndTraceFull",
    "Left",
    "Right",
    "LeftFull",
    "RouterList",
    "FullCustom",
    "Reporter",
];
describe("Logger › init", () => {
    beforeAll(async () => {
        await ready;
    });
    it("returns a usable singleton", () => {
        const a = Logger.init();
        const b = Logger.init();
        expect(a).toBe(b);
        expect(a).toBe(globalThis.Logger);
    });
    it("pre-builds a writer for every exported writer type", () => {
        const logger = Logger.init();
        for (const type of WRITER_TYPES) {
            expect(logger.writers[type]).toBeDefined();
        }
    });
});
describe("Logger › writer()", () => {
    it("returns a Writable exposing the documented surface", () => {
        const wr = Logger.init().writer("Left");
        for (const m of ["write", "format", "group", "endGroup", "style"]) {
            expect(typeof wr[m]).toBe("function");
        }
    });
    it("style() returns the writer for chaining", () => {
        const wr = Logger.init().writer("Left");
        expect(wr.style("system")).toBe(wr);
    });
    it.each(WRITER_TYPES)("renders %s.write() without throwing", (type) => {
        const wr = Logger.init().writer(type);
        expect(() => wr.write("phase-1 logger smoke")).not.toThrow();
        expect(() => wr.style("clear").write("styled line")).not.toThrow();
    });
});
describe("Logger › top-level log methods", () => {
    it.each(["log", "info", "warn", "error"])("%s() accepts strings and objects", (method) => {
        const logger = Logger.init();
        expect(() => logger[method]("a string message")).not.toThrow();
        expect(() => logger[method]({ nested: { value: 1 } })).not.toThrow();
        expect(() => logger[method]("multi", "args", { x: 1 })).not.toThrow();
    });
});
describe("Logger › group management", () => {
    it("opens and closes groups symmetrically", () => {
        const wr = Logger.init().writer("Left");
        const before = Writer.groups.length;
        wr.group("PHASE1");
        expect(Writer.groups.length).toBe(before + 1);
        wr.endGroup("PHASE1");
        expect(Writer.groups.length).toBe(before);
    });
});
