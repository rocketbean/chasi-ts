/**
 * Phase 7 — container/middlewares/Auth.ts (request guard + sdk handler).
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import authMw, { authSdk } from "../../../src/container/middlewares/Auth.js";

describe("Auth middleware", () => {
  it("passes the request through (jwt is handled by the driver)", async () => {
    const next = vi.fn();
    await authMw({} as any, {} as any, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("authSdk handler", () => {
  it("advances when a token string is present", async () => {
    const next = vi.fn();
    await authSdk("a-token", next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("throws a 401 when the token is missing or not a string", async () => {
    await expect(authSdk(undefined as any, vi.fn())).rejects.toMatchObject({ status: 401 });
    await expect(authSdk(123 as any, vi.fn())).rejects.toMatchObject({ status: 401 });
  });
});
