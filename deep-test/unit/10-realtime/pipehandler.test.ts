/**
 * Phase 10 — PipeHandler.format() dispatch + frame delimiters.
 *
 * PipeHandler's constructor opens fds 3/4 (cluster stdio) which don't exist in a
 * plain test process, so we exercise format() bound to a real EventEmitter rather
 * than constructing the class. The reassembly logic itself is covered by
 * stream-framing.test.ts (identical algorithm).
 */
import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "events";
import "../../harness/globals.ts";
import PipeHandler, { PIPE_DELIM } from "../../../src/package/framework/Chasi/PipeHandler.js";

function formatter() {
  const ee: any = new EventEmitter();
  ee.format = (PipeHandler.prototype as any).format;
  return ee;
}

describe("PIPE_DELIM", () => {
  it("defines the frame start/end delimiters", () => {
    expect(PIPE_DELIM).toEqual({ start: "<=====|", end: "|=====>" });
  });
});

describe("PipeHandler.format", () => {
  it("emits the message action with its transmit payload", () => {
    const ee = formatter();
    const spy = vi.fn();
    ee.on("server::ready", spy);
    ee.format(JSON.stringify({ action: "server::ready", transmit: { pid: 7 } }));
    expect(spy).toHaveBeenCalledWith({ pid: 7 });
  });

  it("ignores malformed JSON without throwing", () => {
    const ee = formatter();
    expect(() => ee.format("not-json")).not.toThrow();
  });

  it("does nothing when there is no action field", () => {
    const ee = formatter();
    const spy = vi.fn();
    ee.on("x", spy);
    ee.format(JSON.stringify({ transmit: { a: 1 } }));
    expect(spy).not.toHaveBeenCalled();
  });
});
