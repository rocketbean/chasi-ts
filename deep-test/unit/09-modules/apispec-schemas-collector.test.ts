/**
 * Phase 9 — ApiSpec SchemaCollection: collecting Mongoose model schemas + type map.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import SchemaCollection from "../../../src/container/modules/ApiSpecs/collections/Schemas.js";

const prevApp = (globalThis as any).$app;

beforeEach(() => {
  SchemaCollection.schemas = {};
  (globalThis as any).$app = {
    $modules: {
      Database: {
        $databases: {
          _: { config: { driver: "mongodb" } }, // skipped (alias)
          dev: {
            config: { driver: "mongodb" },
            name: "dev",
            connection: {
              models: {
                user: { schema: { paths: { name: { instance: "String" }, age: { instance: "Number" } } } },
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

describe("SchemaCollection.collectSchemas (mongodb)", () => {
  it("collects a [conn]model entry with field instance types", () => {
    new SchemaCollection().collectSchemas();
    expect(SchemaCollection.schemas["[dev]user"]).toEqual({
      name: { type: "String" },
      age: { type: "Number" },
    });
  });

  it("skips the '_' alias connection", () => {
    new SchemaCollection().collectSchemas();
    expect(Object.keys(SchemaCollection.schemas)).toEqual(["[dev]user"]);
  });
});

describe("SchemaCollection.mapFieldType", () => {
  it("maps driver-native types to OpenAPI types", () => {
    expect(SchemaCollection.mapFieldType("String")).toBe("string");
    expect(SchemaCollection.mapFieldType("Number")).toBe("number");
    expect(SchemaCollection.mapFieldType("ObjectId")).toBe("string");
    expect(SchemaCollection.mapFieldType("Int")).toBe("integer");
    expect(SchemaCollection.mapFieldType("Json")).toBe("object");
  });

  it("defaults unknown types to string", () => {
    expect(SchemaCollection.mapFieldType("Wat")).toBe("string");
  });
});
