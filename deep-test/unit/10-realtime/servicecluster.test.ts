/**
 * Phase 10 — ServiceCluster config/data surface (real forking is integration tier).
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import ServiceCluster from "../../../src/package/framework/Chasi/ServiceCluster.js";

function makeCluster(serviceCluster: any) {
  const session: any = { config: { server: { serviceCluster } } };
  return new ServiceCluster(session);
}

describe("ServiceCluster", () => {
  it("parses the running node version", () => {
    expect(ServiceCluster.nodeVer).toBe(Number(process.version.match(/^v(\d+\.\d+)/)![1]));
  });

  it("reads the serviceCluster config from the session", () => {
    const c = makeCluster({ enabled: true, workers: 4, schedulingPolicy: 2 });
    expect(c.config.workers).toBe(4);
    expect(c.config.enabled).toBe(true);
  });

  it("exposes ClusterData derived from config + process", () => {
    const c = makeCluster({ enabled: true, workers: 2, schedulingPolicy: 1 });
    expect(c.ClusterData).toMatchObject({
      threads: 2,
      scheduling: 1,
      process: process.pid,
      pids: [],
      ids: [],
    });
  });

  it("getMethods enumerates function members of an object", () => {
    const c = makeCluster({ enabled: false, workers: 1, schedulingPolicy: 2 });
    const methods = c.getMethods({ a: () => {}, b: 1, c: function () {} });
    expect(methods).toEqual(expect.arrayContaining(["a", "c"]));
    expect(methods).not.toContain("b");
  });
});
