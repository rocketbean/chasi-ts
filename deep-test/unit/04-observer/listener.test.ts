/**
 * Phase 4 — Observer/Listener.ts.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import Listener from "../../../src/package/Observer/Listener.js";

describe("Listener", () => {
  it("carries the event name and callback", () => {
    const cb = vi.fn();
    const lis = new Listener("authorized", cb);
    expect(lis.ev).toBe("authorized");
    expect(lis.callback).toBe(cb);
  });

  it("defaults options to { fired: 0, limit: -1, params: {} }", () => {
    const lis = new Listener("e", vi.fn());
    expect(lis.options).toEqual({ fired: 0, limit: -1, params: {} });
  });

  it("merges provided opts over the defaults", () => {
    const lis = new Listener("e", vi.fn(), { limit: 3, params: { a: 1 } });
    expect(lis.options).toMatchObject({ fired: 0, limit: 3, params: { a: 1 } });
  });
});
