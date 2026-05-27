import { describe, expect, test, beforeAll } from "vitest";
import { app } from "../setup.ts";
import App from "../helper.ts";
console.clear();

const $app = new app({ basePath: "/api/users", signinUrl: "/signin" });

export default async ($app: App) => {
describe("Route capabilities", async () => {
  beforeAll(async () => {
    await $app.send({ url: "/forget", method: "post" });
  });

  describe("Route resolution", () => {
    test("unknown route returns 404", async () => {
      const res = await $app.send({ url: "/nonexistent", method: "get", raw: true });
      expect(res.statusCode).toBe(404);
    });

    test("unknown route under /api returns 404", async () => {
      const res = await $app.send({ url: "/unknown", method: "get" });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /signup", () => {
    test("creates a user and returns 200", async () => {
      const res = await $app.send({
        url: "/users/signup",
        method: "post",
        logUrl: true,
        data: { name: "Test User", email: "test@test.com", alias: "testuser", password: "securepass" },
      });
      if (res.statusCode !== 200) console.error("[signup 200]", res.statusCode, res.body);
      expect(res.statusCode).toBe(200);
    });

    test("returns an error on duplicate email or alias", async () => {
      const res = await $app.send({
        url: "/users/signup",
        method: "post",
        data: { name: "Test User", email: "test@test.com", alias: "testuser", password: "securepass" },
      });
      expect(res.statusCode).not.toBe(200);
    });
  });

  describe("POST /signin", () => {
    test("returns 422 when credentials are missing", async () => {
      const res = await $app.send({
        url: "/users/signin",
        method: "post",
        data: { email: "test@test.com" },
      });
      if (res.statusCode !== 422) console.error("[signin 422]", res.statusCode, res.body);
      expect(res.statusCode).toBe(422);
    });

    test("returns 200 with token on valid credentials", async () => {
      const res = await $app.send({
        url: "/users/signin",
        method: "post",
        data: { email: "test@test.com", pass: "securepass" },
      });
      if (res.statusCode !== 200) console.error("[signin 200]", res.statusCode, res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
    });

    test("returns an error on wrong password", async () => {
      const res = await $app.send({
        url: "/signin",
        method: "post",
        data: { email: "test@test.com", pass: "wrongpassword" },
      });
      expect(res.statusCode).not.toBe(200);
    });
  });
});
}