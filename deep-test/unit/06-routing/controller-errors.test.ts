/**
 * Phase 6 — controller error throwing (formatting into a response is Phase 7).
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import UserController from "../../../src/container/controllers/v1/UserController.js";
import Models from "../../../src/package/framework/Database/Models.js";

function makeUC(user: any) {
  Models.collection = { user } as any;
  return new UserController();
}

describe("UserController error paths", () => {
  it("create() throws a {status:400} when the email already exists", async () => {
    const user = { findOne: vi.fn(async () => ({ _id: "dup" })), create: vi.fn() };
    const uc = makeUC(user);
    await expect(uc.create({ body: { email: "a@b.c" } } as any, {} as any)).rejects.toMatchObject({
      status: 400,
      message: "Email already exists",
    });
    expect(user.create).not.toHaveBeenCalled();
  });

  it("signin() rethrows the credential error", async () => {
    const user = {
      findByCredentials: vi.fn(async () => {
        throw { status: 401, message: "wrong credentials" };
      }),
    };
    const uc = makeUC(user);
    await expect(uc.signin({ body: { email: "a@b.c", pass: "x" } } as any, {} as any)).rejects.toMatchObject({
      status: 401,
    });
  });
});
