/**
 * Phase 5 — container/models/Unit.ts & Property.ts schema shape + required fields.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import mongoose from "mongoose";
import Models from "../../../src/package/framework/Database/Models.js";

let Unit: any;
let Property: any;

beforeAll(async () => {
  Models.$databases = {
    test: { config: { driver: "mongodb" }, driverName: "mongodb", connection: mongoose },
  } as any;
  Unit = (await import("../../../src/container/models/Unit.js")).default;
  Property = (await import("../../../src/container/models/Property.js")).default;
});

describe("Unit model", () => {
  it("is named 'unit' with name/code/property paths", () => {
    expect(Unit.modelName).toBe("unit");
    expect(Object.keys(Unit.schema.paths)).toEqual(
      expect.arrayContaining(["name", "code", "property"]),
    );
  });

  it("requires name, code and property", async () => {
    const err: any = await new Unit({}).validate().catch((e: any) => e);
    expect(err.errors.name).toBeDefined();
    expect(err.errors.code).toBeDefined();
    expect(err.errors.property).toBeDefined();
  });
});

describe("Property model", () => {
  it("is named 'property' with name/code/units paths", () => {
    expect(Property.modelName).toBe("property");
    expect(Object.keys(Property.schema.paths)).toEqual(
      expect.arrayContaining(["name", "code", "units"]),
    );
  });

  it("requires name and code (units is an optional array)", async () => {
    const err: any = await new Property({}).validate().catch((e: any) => e);
    expect(err.errors.name).toBeDefined();
    expect(err.errors.code).toBeDefined();
    expect(err.errors.units).toBeUndefined();
  });
});
