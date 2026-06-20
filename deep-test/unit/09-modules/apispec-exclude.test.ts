/**
 * Phase 9 — SchemaCollection driver/model include-exclude filtering.
 * include always wins over exclude; model matching is case-insensitive.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import SchemaCollection from "../../../src/container/modules/ApiSpecs/collections/Schemas.js";

describe("isDriverAllowed", () => {
  it("allows everything with no filter", () => {
    expect(SchemaCollection.isDriverAllowed("dev")).toBe(true);
  });
  it("honors exclude", () => {
    expect(SchemaCollection.isDriverAllowed("test", { drivers: { exclude: ["test"] } } as any)).toBe(false);
    expect(SchemaCollection.isDriverAllowed("dev", { drivers: { exclude: ["test"] } } as any)).toBe(true);
  });
  it("lets include win over exclude", () => {
    const filter: any = { drivers: { include: ["dev"], exclude: ["test"] } };
    expect(SchemaCollection.isDriverAllowed("dev", filter)).toBe(true);
    expect(SchemaCollection.isDriverAllowed("test", filter)).toBe(false);
  });
});

describe("isModelAllowed", () => {
  it("allows when no model filter for the driver", () => {
    expect(SchemaCollection.isModelAllowed("dev", "user")).toBe(true);
  });
  it("excludes case-insensitively", () => {
    const filter: any = { models: { dev: { exclude: ["User"] } } };
    expect(SchemaCollection.isModelAllowed("dev", "user", filter)).toBe(false);
    expect(SchemaCollection.isModelAllowed("dev", "post", filter)).toBe(true);
  });
  it("include wins over exclude", () => {
    const filter: any = { models: { dev: { include: ["Post"], exclude: ["post"] } } };
    expect(SchemaCollection.isModelAllowed("dev", "post", filter)).toBe(true);
    expect(SchemaCollection.isModelAllowed("dev", "user", filter)).toBe(false);
  });
});

describe("collection-level exclude", () => {
  const prevApp = (globalThis as any).$app;
  beforeEach(() => {
    SchemaCollection.schemas = {};
    (globalThis as any).$app = {
      $modules: {
        Database: {
          $databases: {
            dev: {
              config: { driver: "mongodb" },
              name: "dev",
              connection: {
                models: {
                  user: { schema: { paths: { name: { instance: "String" } } } },
                  secret: { schema: { paths: { token: { instance: "String" } } } },
                },
              },
            },
          },
        },
      },
    };
  });
  afterEach(() => {
    (globalThis as any).$app = prevApp;
  });

  it("skips an excluded model during collection", () => {
    new SchemaCollection().collectSchemas({ models: { dev: { exclude: ["secret"] } } } as any);
    expect(SchemaCollection.schemas["[dev]user"]).toBeDefined();
    expect(SchemaCollection.schemas["[dev]secret"]).toBeUndefined();
  });
});
