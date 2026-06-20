/**
 * Phase 3 — Terminal exception logger + ExceptionLogger channel routing.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
import TerminalLogger from "../../../src/package/framework/ErrorHandler/loggers/Terminal.js";
import ExceptionLogger from "../../../src/package/framework/ErrorHandler/ExceptionLogger.js";

describe("TerminalLogger", () => {
  let spy: ReturnType<typeof vi.spyOn>;
  afterEach(() => spy?.mockRestore());

  it("writes the formatted message to stdout", async () => {
    spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    await new TerminalLogger().write("· failure");
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0][0])).toContain("failure");
  });

  it("also writes the stack when one is supplied", async () => {
    spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    await new TerminalLogger().write("· failure", "at file.ts:1:1");
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe("ExceptionLogger › channel routing", () => {
  it("selects the TerminalLogger for LogType.type 'terminal'", () => {
    const el = new ExceptionLogger({ LogType: { type: "terminal" } } as any);
    expect(el.writer).toBeInstanceOf(TerminalLogger);
  });
});
