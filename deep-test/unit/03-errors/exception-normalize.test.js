/**
 * Phase 3 — Exception base normalization + ErrorHandler.handle().
 *
 * The Exception base constructor emits "__exception__" on the static $observer,
 * so we install a mock observer via Exception.init() before constructing any.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import "../../harness/globals.ts";
import ErrorHandler from "../../../src/package/framework/ErrorHandler/index.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
import ChasiException from "../../../src/package/framework/ErrorHandler/exceptions/ChasiException.js";
const observer = { emit: vi.fn() };
beforeAll(async () => {
    await Exception.init(observer);
});
beforeEach(() => observer.emit.mockClear());
describe("ErrorHandler.handle › normalization", () => {
    const eh = new ErrorHandler();
    it("normalizes a string into a ChasiException", () => {
        const ex = eh.handle("something broke");
        expect(ex).toBeInstanceOf(ChasiException);
        expect(ex).toBeInstanceOf(Error);
        expect(ex.message).toBe("something broke");
    });
    it("defaults to ChasiException when no exception name is given", () => {
        expect(eh.handle({ message: "no name supplied" })).toBeInstanceOf(ChasiException);
    });
    it("preserves a plain {status, message} throw on the exception's property", () => {
        const ex = eh.handle({ status: 422, message: "bad body" });
        expect(ex.message).toBe("bad body");
        expect(ex.property.status).toBe(422);
    });
    it("can select a registered exception class by name", () => {
        const ex = eh.handle({ message: "via api" }, "APIException");
        expect(ex.constructor.name).toBe("APIException");
    });
});
describe("Exception base", () => {
    it("emits '__exception__' carrying itself on construction", () => {
        const ex = new ChasiException({ message: "fired" });
        expect(observer.emit).toHaveBeenCalledWith("__exception__", { exception: ex });
    });
    it("defaults showStack to true and resolves an invoker string", () => {
        const ex = new ChasiException({ message: "trace me" });
        expect(ex.property.showStack).toBe(true);
        expect(typeof ex.invoker).toBe("string");
    });
    it("respects an explicit showStack:false", () => {
        const ex = new ChasiException({ message: "no stack", showStack: false });
        expect(ex.property.showStack).toBe(false);
    });
    // DISCOVERY (4.1.2 fragility): setInvoker() filters out every stack line that
    // contains the message as a substring. A message like "x" appears in almost
    // every stack frame path, leaving zero lines and crashing on `stack.split`.
    // Pinned as actual behavior so a future hardening of setInvoker flips this red.
    it("throws when the message is a common substring of the stack (setInvoker fragility)", () => {
        expect(() => new ChasiException({ message: "x" })).toThrow(TypeError);
    });
});
describe("ErrorHandler.fireOnCommit", () => {
    it("collects committed exceptions into the static errors list", () => {
        const eh = new ErrorHandler();
        const before = ErrorHandler.errors.length;
        const ex = new ChasiException({ message: "committed" });
        eh.fireOnCommit(ex);
        expect(ErrorHandler.errors.length).toBe(before + 1);
        expect(ErrorHandler.errors).toContain(ex);
    });
});
