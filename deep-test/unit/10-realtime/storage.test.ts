/**
 * Phase 10 — SessionStorage data operations (terminal rendering suppressed).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import SessionStorage from "../../../src/package/framework/Chasi/Storage.js";

let stdoutSpy: any;
const stores: SessionStorage[] = [];

beforeEach(() => {
  stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});
afterEach(() => {
  stores.forEach((s) => s.destroy());
  stores.length = 0;
  stdoutSpy.mockRestore();
});

function make(config: any) {
  const s = new SessionStorage(config);
  stores.push(s);
  return s;
}

describe("SessionStorage.write", () => {
  it("appends a message to the target section when disabled", () => {
    const s = make({ enabled: false });
    s.write("hello", "logs");
    expect(s.data.logs).toContain("hello");
  });

  it("appends to the target section in the primary process", () => {
    const s = make({ enabled: true });
    s.write("booted", "boot");
    expect(s.data.boot).toContain("booted");
  });
});

describe("SessionStorage cluster data", () => {
  it("stores cluster data and renders a threads section", () => {
    const s = make({ enabled: true });
    s.setClusterData({ threads: 2, scheduling: 2, process: 999, pids: ["1", "2"], ids: ["1", "2"] } as any);
    expect(s.clusterData).toMatchObject({ threads: 2 });
    expect(s.data.threads.length).toBeGreaterThan(0);
  });
});

describe("SessionStorage.destroy", () => {
  it("tears down timers/handlers without throwing", () => {
    const s = new SessionStorage({ enabled: true });
    expect(() => s.destroy()).not.toThrow();
  });
});
