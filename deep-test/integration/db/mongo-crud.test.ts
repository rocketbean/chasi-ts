/**
 * Phase 5/12 — live MongoDB CRUD through the booted model collection.
 * Opt-in: DEEP_INTEGRATION=1 with a running MongoDB (see docker-compose.test.yml).
 */
import { describe, it, expect, afterAll } from "vitest";
import { boot, shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("integration › mongo CRUD", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("creates, reads and deletes a user document against live mongo", async () => {
    await boot();
    const Models = (await import("../../../src/package/framework/Database/Models.js")).default;
    const User = Models.collection.user as any;
    expect(User).toBeDefined();

    const stamp = Date.now();
    const created = await User.create({
      name: "Crud",
      alias: `crud${stamp}`,
      email: `crud${stamp}@test.co`,
      password: "secret1",
    });
    expect(created._id).toBeDefined();

    const found = await User.findOne({ email: `crud${stamp}@test.co` });
    expect(found).toBeTruthy();

    await User.deleteOne({ _id: created._id });
    const gone = await User.findOne({ _id: created._id });
    expect(gone).toBeNull();
  });
});
