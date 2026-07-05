/**
 * Phase 9 — SchemaCollection.toOpenApiSchemas keyFormat (plain vs prefixed) + x-driver.
 */
import { describe, it, expect, beforeEach } from "vitest";
import "../../harness/globals.ts";
import SchemaCollection from "../../../src/container/modules/ApiSpecs/collections/Schemas.js";

beforeEach(() => {
  SchemaCollection.schemas = {
    "[dev]user": { name: { type: "String" } },
    "[pg]users": { id: { type: "Int" } },
  };
});

describe("toOpenApiSchemas", () => {
  it("plain keyFormat uses the bare model name", () => {
    const out = new SchemaCollection().toOpenApiSchemas("plain");
    expect(Object.keys(out).sort()).toEqual(["user", "users"]);
  });

  it("prefixed keyFormat uses connection:model", () => {
    const out = new SchemaCollection().toOpenApiSchemas("prefixed");
    expect(Object.keys(out).sort()).toEqual(["dev:user", "pg:users"]);
  });

  it("always includes x-driver and mapped property types", () => {
    const out: any = new SchemaCollection().toOpenApiSchemas("plain");
    expect(out.user["x-driver"]).toBe("dev");
    expect(out.user.type).toBe("object");
    expect(out.user.properties.name.type).toBe("string");
    expect(out.users.properties.id.type).toBe("integer");
  });
});
