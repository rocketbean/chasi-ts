/**
 * Phase 5 — Model statics (connect / drizzle / prisma) against a stubbed
 * $databases registry.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../harness/globals.ts";
import Model from "../../../src/package/statics/Model.js";
import Models from "../../../src/package/framework/Database/Models.js";

beforeEach(() => {
  Models.$databases = {} as any;
});

describe("Model.connect (mongodb)", () => {
  it("returns connection.model(name, schema) for a mongodb connection", () => {
    const model = vi.fn((n: string) => ({ modelName: n }));
    Models.$databases = { c: { config: { driver: "mongodb" }, connection: { model } } } as any;
    const schema = { fake: "schema" } as any;
    const result = Model.connect("User", schema, "c");
    expect(model).toHaveBeenCalledWith("User", schema);
    expect(result).toEqual({ modelName: "User" });
  });

  it("defaults to the '_' connection", () => {
    const model = vi.fn((n: string) => ({ modelName: n }));
    Models.$databases = { _: { config: { driver: "mongodb" }, connection: { model } } } as any;
    Model.connect("User", {} as any);
    expect(model).toHaveBeenCalled();
  });

  it("returns undefined for a non-mongodb driver", () => {
    Models.$databases = { c: { config: { driver: "drizzle" }, connection: {} } } as any;
    expect(Model.connect("User", {} as any, "c")).toBeUndefined();
  });

  it("returns undefined (and does not throw) for a missing connection", () => {
    expect(Model.connect("User", {} as any, "ghost")).toBeUndefined();
  });
});

describe("Model.drizzle", () => {
  it("returns the live client for a drizzle connection", () => {
    Models.$databases = { d: { driverName: "drizzle", connection: { q: 1 } } } as any;
    expect(Model.drizzle("d")).toEqual({ q: 1 });
  });

  it("throws when the connection is missing", () => {
    expect(() => Model.drizzle("nope")).toThrow(/No connection found/);
  });

  it("throws when the connection uses a different driver", () => {
    Models.$databases = { d: { driverName: "mongodb", connection: {} } } as any;
    expect(() => Model.drizzle("d")).toThrow(/not "drizzle"/);
  });
});

describe("Model.prisma", () => {
  it("returns the live client for a prisma connection", () => {
    Models.$databases = { p: { driverName: "prisma", connection: { user: {} } } } as any;
    expect(Model.prisma("p")).toEqual({ user: {} });
  });

  it("throws for a missing or mismatched connection", () => {
    expect(() => Model.prisma("nope")).toThrow(/No connection found/);
    Models.$databases = { p: { driverName: "mongodb", connection: {} } } as any;
    expect(() => Model.prisma("p")).toThrow(/not "prisma"/);
  });
});
