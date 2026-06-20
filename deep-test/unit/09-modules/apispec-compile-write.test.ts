/**
 * Phase 9 — ApiSpec Compiler.compile() assembly + write(), and ApiSpec.init end-to-end.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import "../../harness/globals.ts";
import ApiSpec from "../../../src/container/modules/ApiSpecs/spec.js";
import Compiler from "../../../src/container/modules/ApiSpecs/Compiler.js";
import SchemaCollection from "../../../src/container/modules/ApiSpecs/collections/Schemas.js";
import RouterCollection from "../../../src/container/modules/ApiSpecs/collections/Routers.js";

const prevApp = (globalThis as any).$app;

function baseConfig(filename: string) {
  return {
    definition: {
      openapi: "3.0.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [{ url: "http://localhost:3099" }],
    },
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } },
    security: [{ bearerAuth: [] }],
    schemas: { keyFormat: "plain" },
    output: { filename, pretty: true },
  } as any;
}

beforeEach(() => {
  SchemaCollection.schemas = {};
  RouterCollection.paths = {};
  (globalThis as any).$app = { $modules: { Database: { $databases: {} }, RouterModule: { routers: [] } } };
});
afterEach(() => {
  (globalThis as any).$app = prevApp;
});

describe("Compiler.compile", () => {
  it("assembles an OpenAPI document from config + collections", () => {
    SchemaCollection.schemas = { "[dev]user": { name: { type: "String" } } };
    RouterCollection.paths = { "/api/x": { get: {} } } as any;
    const schemas = new SchemaCollection();
    const routers = new RouterCollection();
    const doc: any = new Compiler(baseConfig("ignore.json"), schemas, routers).compile();

    expect(doc.openapi).toBe("3.0.0");
    expect(doc.info.title).toBe("Test API");
    expect(doc.servers[0].url).toBe("http://localhost:3099");
    expect(doc.paths).toEqual({ "/api/x": { get: {} } });
    expect(doc.components.schemas.user).toBeDefined();
    expect(doc.components.securitySchemes.bearerAuth).toBeDefined();
    expect(doc.security).toEqual([{ bearerAuth: [] }]);
  });
});

describe("ApiSpec.init + compile (writes file)", () => {
  let tmp: string;
  beforeEach(() => {
    tmp = path.join(os.tmpdir(), `deep-api-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  });
  afterEach(() => {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  });

  it("initializes the singleton and writes a valid spec file", async () => {
    await ApiSpec.init(baseConfig(tmp));
    expect(ApiSpec.instance).toBeDefined();
    const doc = await ApiSpec.instance.compile();
    expect(doc.openapi).toBe("3.0.0");
    const written = JSON.parse(fs.readFileSync(tmp, "utf-8"));
    expect(written.info.title).toBe("Test API");
    expect(written.openapi).toBe("3.0.0");
  });
});
