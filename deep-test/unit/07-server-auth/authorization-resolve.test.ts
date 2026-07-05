/**
 * Phase 7 — Authentication.createDrivers() + Authorization alias.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Authentication from "../../../src/package/framework/Server/Authentication.js";
import Authorization from "../../../src/package/statics/Authorization.js";
import JWTDriver from "../../../src/package/framework/Server/AuthDrivers/jwt.js";

const config = {
  drivers: {
    dev: { driver: "jwt", handler: null, key: "resolve-key", model: "user", AuthRouteExceptions: [] },
  },
  defaultJWTDriverPAth: "package/framework/Server/AuthDrivers/jwt.js",
};

describe("Authentication.init", () => {
  beforeAll(async () => {
    await new Authentication(config as any).init();
  });

  it("instantiates a JWTDriver for each configured driver", () => {
    expect(Authentication.$drivers.dev).toBeInstanceOf(JWTDriver);
    expect(Authentication.$drivers.dev.property.key).toBe("resolve-key");
  });

  it("falls back to the default jwt handler path when handler is null", () => {
    expect(config.drivers.dev.handler).toBe(config.defaultJWTDriverPAth);
  });
});

describe("Authorization", () => {
  it("is an alias subclass of Authentication", () => {
    expect(new Authorization({ drivers: {} } as any)).toBeInstanceOf(Authentication);
  });
});
