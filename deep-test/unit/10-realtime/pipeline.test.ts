/**
 * Phase 10 — Pipeline (Duplex stream used between primary and workers).
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import Pipeline from "../../../src/package/framework/Chasi/Pipeline.js";

const flush = () => new Promise((r) => setTimeout(r, 5));

describe("Pipeline", () => {
  it("reports the dock type for the current process", () => {
    // tests run in the primary process
    expect(new Pipeline().dockType).toBe("main");
  });

  it("pipes written chunks through to the readable side", async () => {
    const p = new Pipeline();
    const chunks: string[] = [];
    p.on("data", (c) => chunks.push(c.toString()));
    p.write("hello");
    p.write("world");
    await flush();
    expect(chunks).toEqual(["hello", "world"]);
  });

  it("finalizes cleanly on end()", async () => {
    const p = new Pipeline();
    p.resume();
    const done = new Promise<boolean>((res) => p.on("finish", () => res(true)));
    p.end();
    await expect(done).resolves.toBe(true);
  });
});
