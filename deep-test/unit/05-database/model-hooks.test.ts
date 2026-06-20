/**
 * Phase 5 — user model schema hooks & transforms.
 * The toJSON transform and registered pre-save hook are inspectable without a DB;
 * the bcrypt hashing inside the save hook needs a live connection (integration).
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import mongoose from "mongoose";
import Models from "../../../src/package/framework/Database/Models.js";

let User: any;

beforeAll(async () => {
  Models.$databases = {
    test: { config: { driver: "mongodb" }, driverName: "mongodb", connection: mongoose },
  } as any;
  User = (await import("../../../src/container/models/user.js")).default;
});

describe("user model › schema shape", () => {
  it("declares the expected paths", () => {
    expect(Object.keys(User.schema.paths)).toEqual(
      expect.arrayContaining(["name", "password", "alias", "email"]),
    );
  });
});

describe("user model › toJSON transform", () => {
  it("strips the password from serialized output", () => {
    const doc = new User({ name: "a", alias: "al", email: "a@b.co", password: "secret1" });
    const json = doc.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.name).toBe("a");
  });
});

describe("user model › pre-save hook", () => {
  it("registers a 'save' pre hook on the schema", () => {
    const pres = (User.schema as any).s?.hooks?._pres?.get("save");
    expect(Array.isArray(pres)).toBe(true);
    expect(pres.length).toBeGreaterThan(0);
  });

  it.todo("the pre-save hook bcrypt-hashes a modified password (integration tier)");
});
