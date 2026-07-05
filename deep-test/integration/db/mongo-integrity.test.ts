/**
 * Phase 5/12 — MongoDB data-integrity against a live database.
 *
 * Where mongo-crud.test.ts proves the happy-path C/R/D wiring, this suite pins
 * the integrity guarantees the framework's model layer relies on under mongoose
 * v9: unique-index enforcement, the pre-save bcrypt hashing hook (+ isModified
 * guard), update round-trips, validation at save time, ObjectId casting, and
 * ref population.
 *
 * Opt-in: DEEP_INTEGRATION=1 with a running MongoDB (see docker-compose.test.yml).
 * Everything created here is tagged with a per-run `stamp` and removed in
 * afterAll, so reruns stay green.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { boot, shutdown } from "../../harness/app.ts";
import mongoose from "mongoose";

const { Types } = mongoose;
const RUN = !!process.env.DEEP_INTEGRATION;
const stamp = Date.now();
let seq = 0;

let User: any;
let Property: any;
let Unit: any;

/** A valid, unique user payload. Each call gets a fresh `apps` id so unrelated
 *  rows never collide on the `apps` unique index — tests opt into collisions. */
const mkUser = (over: Record<string, unknown> = {}) => ({
  name: "Itg",
  alias: `al-${stamp}-${seq++}`,
  email: `u-${stamp}-${seq++}@itg.test`,
  password: "secret1",
  apps: [new Types.ObjectId()],
  ...over,
});

describe.skipIf(!RUN)("integration › mongo integrity", () => {
  beforeAll(async () => {
    await boot();
    const Models = (await import("../../../src/package/framework/Database/Models.js")).default;
    User = Models.collection.user;
    Property = Models.collection.property;
    Unit = Models.collection.unit;
    // Start from a known-clean slate. The `deepTest` DB is a dedicated
    // integration scratch DB and (with DEEP_INTEGRATION set) integration files
    // run serially, so this is safe — and it's required because leftover rows
    // with an empty `apps` array make the `apps` unique index unbuildable.
    await Promise.all([
      User.deleteMany({}),
      Property?.deleteMany({}),
      Unit?.deleteMany({}),
    ]);
    // boot()'s autoIndex may have already failed to build `apps_1` against the
    // dirty data. Reset indexes on the now-empty collection and rebuild them
    // from the schema so the unique-index assertions below are valid.
    await User.collection.dropIndexes().catch(() => {});
    await User.syncIndexes();
  });

  afterAll(async () => {
    try {
      const tag = new RegExp(String(stamp));
      await User?.deleteMany({ $or: [{ email: tag }, { alias: tag }] });
      await Unit?.deleteMany({ code: tag });
      await Property?.deleteMany({ code: tag });
    } finally {
      await shutdown();
    }
  });

  // ── unique-index enforcement ────────────────────────────────────────────────
  it("rejects a duplicate email with an E11000 duplicate-key error", async () => {
    const email = `dup-${stamp}@itg.test`;
    await User.create(mkUser({ email }));
    const err: any = await User.create(mkUser({ email })).catch((e) => e);
    expect(err?.code).toBe(11000);
    expect(String(err.message)).toMatch(/email/);
  });

  it("rejects a duplicate alias with an E11000 duplicate-key error", async () => {
    const alias = `dupal-${stamp}`;
    await User.create(mkUser({ alias }));
    const err: any = await User.create(mkUser({ alias })).catch((e) => e);
    expect(err?.code).toBe(11000);
    expect(String(err.message)).toMatch(/alias/);
  });

  it("enforces the unique index on the apps array (shared ref id collides)", async () => {
    const sharedApp = new Types.ObjectId();
    await User.create(mkUser({ apps: [sharedApp] }));
    const err: any = await User.create(mkUser({ apps: [sharedApp] })).catch((e) => e);
    expect(err?.code).toBe(11000);
    expect(String(err.message)).toMatch(/apps/);
  });

  it("allows many users with empty/absent apps (partial-index fix for the signup-500)", async () => {
    // The apps index is now partial ({ apps: { $type: 'objectId' } }), so users
    // without a real app reference are not indexed and never collide — the bug
    // that previously made the 2nd+ user signup fail with E11000 apps_1.
    const a = await User.create(mkUser({ apps: [] }));
    const b = await User.create(mkUser({ apps: undefined }));
    expect(a._id).toBeTruthy();
    expect(b._id).toBeTruthy();
  });

  // ── pre-save bcrypt hashing (was it.todo in model-hooks) ─────────────────────
  it("hashes the password on save and never stores plaintext", async () => {
    const bc = (await import("bcryptjs")).default;
    const u = await User.create(mkUser({ password: "secret1" }));
    expect(u.password).not.toBe("secret1");
    expect(u.password.startsWith("$2")).toBe(true); // bcrypt hash marker
    expect(await bc.compare("secret1", u.password)).toBe(true);
  });

  it("does not re-hash the password when an unrelated field changes", async () => {
    const u = await User.create(mkUser());
    const firstHash = u.password;
    u.name = "Renamed";
    await u.save();
    const reread = await User.findById(u._id);
    expect(reread.password).toBe(firstHash); // isModified('password') guard held
    expect(reread.name).toBe("Renamed");
  });

  // ── update round-trips ──────────────────────────────────────────────────────
  it("persists updates via save() and findOneAndUpdate()", async () => {
    const u = await User.create(mkUser());
    u.name = "Saved";
    await u.save();
    expect((await User.findById(u._id)).name).toBe("Saved");

    const updated = await User.findOneAndUpdate(
      { _id: u._id },
      { name: "Patched" },
      { returnDocument: "after" },
    );
    expect(updated.name).toBe("Patched");
  });

  // ── validation at the persistence boundary ──────────────────────────────────
  it("rejects an invalid document at save time (missing required fields)", async () => {
    const err: any = await User.create({ password: "secret1" }).catch((e) => e);
    expect(err?.name).toBe("ValidationError");
    expect(err.errors.name).toBeDefined();
    expect(err.errors.alias).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("enforces the custom 'password' word validator at save time", async () => {
    const err: any = await User.create(mkUser({ password: "mypassword" })).catch((e) => e);
    expect(err?.name).toBe("ValidationError");
  });

  // ── ObjectId casting ────────────────────────────────────────────────────────
  it("casts a string _id on query and raises CastError for an invalid id", async () => {
    const u = await User.create(mkUser());
    const byString = await User.findOne({ _id: String(u._id) });
    expect(byString?._id?.toString()).toBe(u._id.toString());

    const err: any = await User.findOne({ _id: "not-an-objectid" }).catch((e) => e);
    expect(err?.name).toBe("CastError");
  });

  // ── ref population ──────────────────────────────────────────────────────────
  it("populates property.units with the referenced unit documents", async () => {
    const property = await Property.create({ name: "Tower", code: `p-${stamp}-${seq++}` });
    const unit = await Unit.create({
      name: "101",
      code: `un-${stamp}-${seq++}`,
      property: property._id,
    });
    property.units = [unit._id];
    await property.save();

    const populated = await Property.findById(property._id).populate("units");
    expect(populated.units).toHaveLength(1);
    expect(populated.units[0].name).toBe("101");
    expect(populated.units[0]._id.toString()).toBe(unit._id.toString());
  });
});
