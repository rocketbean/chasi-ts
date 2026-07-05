/**
 * Phase 10 — StreamBucket framing reassembly (the 4.1.x cross-worker regression).
 *
 * Bytes arrive in arbitrary fragments: a frame may be split across chunks and
 * several frames may land in one chunk. Every complete <=====|…|=====> frame must
 * be delivered exactly once, in order, with partial tails buffered.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import StreamBucket from "../../../src/package/framework/Chasi/StreamBucket.js";
import { PIPE_DELIM } from "../../../src/package/framework/Chasi/PipeHandler.js";

const frame = (s: string) => PIPE_DELIM.start + s + PIPE_DELIM.end;
const flush = () => new Promise((r) => setTimeout(r, 5));

function bucket() {
  const got: string[] = [];
  const sb = new StreamBucket({} as any, async (_w: any, p: string) => {
    got.push(p);
  });
  return { sb, got };
}

describe("StreamBucket.appendStreamData", () => {
  it("delivers a single complete frame", async () => {
    const { sb, got } = bucket();
    sb.appendStreamData(frame("alpha"));
    await flush();
    expect(got).toEqual(["alpha"]);
  });

  it("splits multiple frames in one chunk", async () => {
    const { sb, got } = bucket();
    sb.appendStreamData(frame("a") + frame("b") + frame("c"));
    await flush();
    expect(got).toEqual(["a", "b", "c"]);
  });

  it("reassembles a frame split across chunks", async () => {
    const { sb, got } = bucket();
    sb.appendStreamData("<=====|par");
    sb.appendStreamData("tial|=====>");
    await flush();
    expect(got).toEqual(["partial"]);
  });

  it("buffers a partial tail until the rest arrives", async () => {
    const { sb, got } = bucket();
    sb.appendStreamData(frame("first") + "<=====|incompl");
    await flush();
    expect(got).toEqual(["first"]);
    sb.appendStreamData("ete|=====>");
    await flush();
    expect(got).toEqual(["first", "incomplete"]);
  });

  it("discards junk before the start delimiter and trims the payload", async () => {
    const { sb, got } = bucket();
    sb.appendStreamData("garbage-bytes" + frame("  clean  "));
    await flush();
    expect(got).toEqual(["clean"]);
  });
});
