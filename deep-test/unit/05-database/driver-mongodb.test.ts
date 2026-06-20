/**
 * Phase 5 — MongoDBDriver (mongoose is mocked; real CRUD is integration tier).
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("mongoose", () => ({
  default: {
    createConnection: vi.fn(() => ({
      asPromise: () => Promise.resolve({ readyState: 1 }),
    })),
  },
}));

import "../../harness/globals.ts";
import mongoose from "mongoose";
import MongoDBDriver from "../../../src/package/framework/Database/drivers/mongodb.js";

describe("MongoDBDriver › setup", () => {
  it("assembles url from url + db + params and flags options", () => {
    const d = new MongoDBDriver(
      { url: "mongodb://host/", db: "mydb", params: "?authSource=admin", options: { connectTimeoutMS: 1000 } } as any,
      "dev",
    );
    expect(d.driverName).toBe("mongodb");
    expect(d.protocol).toBe("mongodb://");
    expect(d.$property.url).toBe("mongodb://host/mydb?authSource=admin");
    expect(d.hasOptions).toBe(true);
    expect(d.$property.options).toEqual({ connectTimeoutMS: 1000 });
  });

  it("leaves hasOptions false when no options are given", () => {
    const d = new MongoDBDriver({ url: "mongodb://host/", db: "x" } as any, "dev");
    expect(d.hasOptions).toBe(false);
  });
});

describe("MongoDBDriver › hideStrings", () => {
  it("masks the credentials/host portion of a connection string", () => {
    const d = new MongoDBDriver({ url: "mongodb://host/" } as any, "dev");
    const masked = d.hideStrings("mongodb://user:pass@host/db");
    expect(masked).not.toContain("user:pass");
    expect(typeof masked).toBe("string");
  });
});

describe("MongoDBDriver › connect", () => {
  it("opens a mongoose connection and resolves it", async () => {
    const d = new MongoDBDriver({ url: "mongodb://host/", db: "x", hideLogConnectionStrings: false } as any, "dev");
    const stop = vi.fn();
    const con = await d.connect(stop);
    expect(mongoose.createConnection).toHaveBeenCalled();
    expect(con).toEqual({ readyState: 1 });
    expect(stop).toHaveBeenCalled();
  });

  it("rethrows when the connection fails", async () => {
    (mongoose.createConnection as any).mockReturnValueOnce({
      asPromise: () => Promise.reject(new Error("refused")),
    });
    const d = new MongoDBDriver({ url: "mongodb://host/", db: "x" } as any, "dev");
    await expect(d.connect(vi.fn())).rejects.toThrow("refused");
  });
});
