/**
 * Phase 12 — express-5 static dotfiles behavior on the real built app.
 *
 * Express 5 changed `express.static`'s `dotfiles` default to "ignore", so
 * dot-directories in public/ now 404. RouterServiceProvider.beforeRoute()
 * explicitly allows `/.well-known` (dotfiles: "allow") — needed for Apple
 * Universal Links / Android App Links / ACME — while every other dotfile stays
 * inaccessible. This pins that behavior against a live `node dist` boot.
 *
 * Opt-in: DEEP_CLUSTER=1 (real-app-boot lane). Creates throwaway fixtures under
 * public/ and removes them (and only-if-empty dirs) afterward.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { startApp, type AppProcess } from "../../harness/app-process.ts";

const RUN = !!process.env.DEEP_CLUSTER;
const pub = path.resolve(process.cwd(), "public");
const wellKnownDir = path.join(pub, ".well-known");
const aasa = path.join(wellKnownDir, "apple-app-site-association");
const secret = path.join(pub, ".secret-itg.txt");
const normal = path.join(pub, "itg-normal.txt");

describe.skipIf(!RUN)("integration › express-5 static dotfiles", () => {
  let app: AppProcess;

  beforeAll(async () => {
    fs.mkdirSync(wellKnownDir, { recursive: true });
    fs.writeFileSync(aasa, "aasa");
    fs.writeFileSync(secret, "secret");
    fs.writeFileSync(normal, "ok");
    app = await startApp({ cluster: false, port: 4366 });
  }, 180_000);

  afterAll(async () => {
    await app?.stop();
    for (const f of [aasa, secret, normal]) fs.rmSync(f, { force: true });
    try { fs.rmdirSync(wellKnownDir); } catch {} // only if now empty
    try { fs.rmdirSync(pub); } catch {} // only if we created it & it's empty
  });

  it("serves /.well-known/* (dotfiles: 'allow')", async () => {
    expect((await app.request("GET", "/.well-known/apple-app-site-association")).status).toBe(200);
  });

  it("still 404s other dotfiles in public/ (secure default preserved)", async () => {
    expect((await app.request("GET", "/.secret-itg.txt")).status).toBe(404);
  });

  it("serves normal public files", async () => {
    expect((await app.request("GET", "/itg-normal.txt")).status).toBe(200);
  });
});
