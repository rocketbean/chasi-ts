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
  await Exception.init(observer as any);
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

  // Previously a 4.1.2 fragility: setInvoker() could filter out every stack line
  // and then crash on `undefined.split(...)`. It is now hardened to fall back to
  // the constructor name, so constructing an exception never throws regardless of
  // the message/stack content.
  it("does not crash when no usable invoker frame remains (hardened setInvoker)", () => {
    let ex!: ChasiException;
    expect(() => (ex = new ChasiException({ message: "x" }))).not.toThrow();
    expect(typeof ex.invoker).toBe("string");
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
