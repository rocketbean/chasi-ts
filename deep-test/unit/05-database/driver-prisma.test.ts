/**
 * Phase 5 — PrismaDriver. Base._fetchFile (the client loader) is spied so no real
 * Prisma client is required; live Prisma is integration tier.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import Base from "../../../src/package/Base.js";
import PrismaDriver from "../../../src/package/framework/Database/drivers/prisma.js";
import Models from "../../../src/package/framework/Database/Models.js";

/** Flush the constructor's fire-and-forget setup() → getDriver() so driver state
 *  is settled before an error-path assertion. */
const settle = () => new Promise((r) => setTimeout(r, 0));

// setModels() reads keys from _runtimeDataModel.models and looks up the same key
// on the client (this.driver[key]), storing it lowercased. Mirror that contract.
class FakePrismaClient {
  _runtimeDataModel = { models: { User: {}, Post: {} } };
  User = { findMany: vi.fn() };
  Post = { findMany: vi.fn() };
}

let spy: any;
beforeEach(() => {
  spy = vi.spyOn(Base as any, "_fetchFile").mockResolvedValue({ PrismaClient: FakePrismaClient });
});
afterEach(() => spy.mockRestore());

function makeDriver() {
  return new PrismaDriver({ url: "mysql://u:p@host/db", options: { client: "./prisma/client" } } as any, "mysql");
}

describe("PrismaDriver", () => {
  it("reports the prisma driverName and builds $property from config", () => {
    const d = makeDriver();
    expect(d.driverName).toBe("prisma");
    expect(d.$property.url).toBe("mysql://u:p@host/db");
    expect(d.hasOptions).toBe(true);
  });

  it("setModels lowercases model names from the runtime data model", async () => {
    const d = makeDriver();
    await (d as any).getDriver("./prisma/client");
    d.setModels();
    expect(d.models.user).toBe((d.driver as any).User);
    expect(d.models.post).toBe((d.driver as any).Post);
  });

  it("connect loads the client, sets the connection and stops the loader", async () => {
    const d = makeDriver();
    const stop = vi.fn();
    const driver = await d.connect(stop);
    expect(driver).toBeInstanceOf(FakePrismaClient);
    expect(d.connection).toBe(driver);
    expect(stop).toHaveBeenCalled();
  });
});

describe("PrismaDriver › error paths (graceful degradation)", () => {
  it("getDriver tolerates a module missing the PrismaClient export (driver stays null)", async () => {
    const d = makeDriver();
    await settle();
    spy.mockResolvedValueOnce({}); // loaded module has no PrismaClient
    (d as any).driver = null;
    await expect(d.getDriver("./client")).resolves.toBeUndefined();
    expect(d.driver).toBeNull();
  });

  it("getDriver tolerates a client-load rejection (e.g. client not generated)", async () => {
    const d = makeDriver();
    await settle();
    spy.mockRejectedValueOnce(new Error("client not generated"));
    (d as any).driver = null;
    await expect(d.getDriver("./missing/client")).resolves.toBeUndefined();
    expect(d.driver).toBeNull();
  });

  it("setModels yields no models when the client failed to load", async () => {
    const d = makeDriver();
    await settle();
    (d as any).driver = null;
    (d as any).models = {};
    d.setModels();
    expect(d.models).toEqual({});
  });

  it("connect still calls stop and sets the connection even when the client fails to load", async () => {
    const d = makeDriver();
    await settle();
    spy.mockResolvedValue({}); // every load (incl. connect's) lacks PrismaClient
    (d as any).driver = null;
    const stop = vi.fn();
    await expect(d.connect(stop)).resolves.toBeNull();
    expect(stop).toHaveBeenCalled();
    expect(d.driver).toBeNull();
  });
});

describe("Models.collectPrismaSchemas", () => {
  it("collects ONLY prisma connections, mapping { client, schema, url }", () => {
    const connections = {
      m: { driver: "mongodb", url: "mongodb://localhost/x" },
      p: {
        driver: "prisma",
        url: "mysql://u:p@host/db",
        options: { client: "./container/prisma/client", schema: "./schema.prisma" },
      },
      d: { driver: "drizzle", url: "postgres://localhost/x" },
    };
    const out = Models.collectPrismaSchemas(connections as any);
    expect(Object.keys(out)).toEqual(["p"]); // mongodb & drizzle excluded
    expect(out.p).toEqual({
      client: "./container/prisma/client",
      schema: "./schema.prisma",
      url: "mysql://u:p@host/db",
    });
    expect(Models.prismaSchemas).toEqual(out); // also stored on the static
  });

  it("returns {} when there are no connections", () => {
    expect(Models.collectPrismaSchemas(undefined as any)).toEqual({});
  });
});
