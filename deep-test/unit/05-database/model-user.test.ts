/**
 * Phase 5 — container/models/user.ts.
 *
 * We inject a connection-less mongoose as the "test" connection so Model.connect
 * builds a real (but un-persisted) Mongoose model. Validators, the toJSON
 * transform and generateAuthToken all work without a live socket; actual save
 * (and the bcrypt pre-save hash) is integration tier.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Models from "../../../src/package/framework/Database/Models.js";
import Authorization from "../../../src/package/statics/Authorization.js";

let User: any;

beforeAll(async () => {
  Models.$databases = {
    test: { config: { driver: "mongodb" }, driverName: "mongodb", connection: mongoose },
  } as any;
  (Authorization as any).$drivers = { _: { property: { key: "unit-secret" } } };
  User = (await import("../../../src/container/models/user.js")).default;
});

describe("user model", () => {
  it("is a Mongoose model named 'user'", () => {
    expect(User).toBeDefined();
    expect(User.modelName).toBe("user");
  });

  it("requires name, alias and email", async () => {
    const err: any = await new User({}).validate().catch((e: any) => e);
    expect(err).toBeTruthy();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.alias).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("rejects a password containing the word 'password'", async () => {
    const err: any = await new User({ name: "a", alias: "al", email: "a@b.co", password: "superpassword" })
      .validate()
      .catch((e: any) => e);
    expect(err).toBeTruthy();
  });

  it("lowercases email and validates a well-formed user", async () => {
    const doc = new User({ name: "a", alias: "al", email: "A@B.Co", password: "secret1" });
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.email).toBe("a@b.co");
  });

  it("generateAuthToken issues a verifiable JWT signed with the driver key", async () => {
    const doc = new User({ name: "a", alias: "al", email: "a@b.co", password: "secret1" });
    const token = await doc.generateAuthToken("_");
    expect(typeof token).toBe("string");
    const decoded: any = jwt.verify(token, "unit-secret");
    expect(decoded._id).toBe(doc._id.toString());
  });
});
