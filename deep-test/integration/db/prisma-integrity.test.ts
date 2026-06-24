/**
 * Phase 12 — REAL Prisma data-integrity THROUGH chasi's PrismaDriver (Prisma 7).
 *
 * Prisma 7 removed `datasource.url` from the schema in favor of `prisma.config.ts`
 * + driver adapters. chasi's PrismaDriver does `new PrismaClient({ ...globals })`,
 * so it works on v7 when `options.globals.adapter` is supplied — this suite proves
 * the end-to-end path against a live Postgres: client generation, adapter wiring
 * via the driver, CRUD, unique-constraint enforcement (P2002), and a transaction.
 *
 * Opt-in: DEEP_INTEGRATION=1 with the Postgres from docker-compose.test.yml
 * (localhost:5433, db "deeptest"). beforeAll writes a transient schema + config,
 * `db push --force-reset`, and `prisma generate`; afterAll disconnects and removes
 * every generated artifact.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import "../../harness/globals.ts";
import PrismaDriver from "../../../src/package/framework/Database/drivers/prisma.js";

const RUN = !!process.env.DEEP_INTEGRATION;
const PG_URL = process.env.PRISMA_TEST_URL ?? "postgresql://postgres:postgres@localhost:5433/deeptest";
const root = process.cwd();
const prismaDir = path.join(root, "src/container/prisma");
const clientDir = path.join(prismaDir, "client");
const schemaPath = path.join(prismaDir, "schema.prisma");
const configPath = path.join(root, "prisma.config.ts");

const SCHEMA = `generator client {
  provider = "prisma-client-js"
  output   = "./client"
}
datasource db {
  provider = "postgresql"
}
model ITUser {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
}
`;

const CONFIG = `import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "src/container/prisma/schema.prisma",
  datasource: { url: env("PRISMA_TEST_URL") },
});
`;

let driver: any;
const model = () => driver.connection.iTUser;

describe.skipIf(!RUN)("integration › prisma driver (real, Prisma 7 adapter)", () => {
  beforeAll(async () => {
    fs.mkdirSync(prismaDir, { recursive: true });
    fs.writeFileSync(configPath, CONFIG);
    fs.writeFileSync(schemaPath, SCHEMA);
    const env = { ...process.env, PRISMA_TEST_URL: PG_URL };
    execSync("npx prisma db push", { cwd: root, env, stdio: "pipe" });
    execSync("npx prisma generate", { cwd: root, env, stdio: "pipe" });

    // chasi's driver does `new PrismaClient({ ...globals })`; Prisma 7 needs an adapter.
    const adapter = new PrismaPg({ connectionString: PG_URL });
    driver = new PrismaDriver(
      { url: PG_URL, options: { client: "container/prisma/client", globals: { adapter } } } as any,
      "pg",
    );
    await driver.connect(() => {});
  }, 120_000);

  afterAll(async () => {
    try {
      await driver?.connection?.$disconnect?.();
    } catch {
      /* ignore */
    }
    fs.rmSync(clientDir, { recursive: true, force: true });
    fs.rmSync(schemaPath, { force: true });
    fs.rmSync(configPath, { force: true });
  });

  it("connects via the adapter and exposes the generated client through the driver", () => {
    expect(driver.driverName).toBe("prisma");
    expect(typeof model()?.create).toBe("function");
  });

  it("performs a full CRUD round-trip", async () => {
    const tag = `crud-${Date.now()}@it.co`;
    const created = await model().create({ data: { email: tag, name: "Crud" } });
    expect(created.id).toBeTruthy();

    const found = await model().findUnique({ where: { email: tag } });
    expect(found?.name).toBe("Crud");

    const updated = await model().update({ where: { id: created.id }, data: { name: "Updated" } });
    expect(updated.name).toBe("Updated");

    await model().delete({ where: { id: created.id } });
    expect(await model().findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("enforces the unique constraint (duplicate email → P2002)", async () => {
    const email = `dup-${Date.now()}@it.co`;
    await model().create({ data: { email, name: "A" } });
    const err: any = await model().create({ data: { email, name: "B" } }).catch((e) => e);
    expect(err?.code).toBe("P2002");
  });

  it("runs a transaction atomically", async () => {
    const s = Date.now();
    const [a, b] = await driver.connection.$transaction([
      model().create({ data: { email: `t1-${s}@it.co`, name: "T1" } }),
      model().create({ data: { email: `t2-${s}@it.co`, name: "T2" } }),
    ]);
    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
  });
});
