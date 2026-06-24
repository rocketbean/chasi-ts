# chasi-ts deep-test

A thorough, version-locked test suite for **chasi-ts** (behavior pinned to **4.1.2**).
Everything related to this effort — plan, harness, fixtures, and tests — lives under
`deep-test/`. The suite has **two tiers**: a fast **unit** tier that mocks all
infrastructure and runs anywhere, and an opt-in **integration** tier that drives the real
booted app against live MongoDB / sockets / clustering.

---

## How to use it

All commands run from the **project root**.

```bash
# 1) Unit tier — the default. No databases, no network, no Docker. Fast (~3s).
npx vitest run --config ./deep-test/vitest.deep.config.ts

# 2) Watch mode while developing one area
npx vitest --config ./deep-test/vitest.deep.config.ts deep-test/unit/06-routing

# 3) Run a single file
npx vitest run --config ./deep-test/vitest.deep.config.ts deep-test/unit/10-realtime/stream-framing.test.ts

# 4) Coverage report (HTML + text) → deep-test/.coverage/
npx vitest run --coverage --config ./deep-test/vitest.deep.config.ts

# 5) Integration tier — opt-in, needs live infra.
docker compose -f deep-test/docker-compose.test.yml up -d         # start MongoDB/PG/MySQL
DEEP_INTEGRATION=1 npx vitest run --config ./deep-test/vitest.deep.config.ts
docker compose -f deep-test/docker-compose.test.yml down -v       # tear down

# See the framework's own boot logs during a run (they are muted by default)
DEEP_VERBOSE=1 npx vitest run --config ./deep-test/vitest.deep.config.ts
```

**Without `DEEP_INTEGRATION=1`, the integration suites self-skip** — the default run is
fully hermetic and green with no setup. Optionally wire these into the root
`package.json`:

```jsonc
"scripts": {
  "test:deep":     "vitest run --config ./deep-test/vitest.deep.config.ts",
  "test:deep:int": "DEEP_INTEGRATION=1 vitest run --config ./deep-test/vitest.deep.config.ts"
}
```

### What you get

- **Unit tier:** ~407 assertions across 83 files (Phases 1–10), runs in a few seconds with
  zero infrastructure.
- **Integration tier:** 11 opt-in files (Phases 11–12) — HTTP e2e, live Mongo CRUD, ws
  round-trip, cluster fork, config matrix — that skip cleanly until `DEEP_INTEGRATION=1`.

---

## Layout

```
deep-test/
├── PLAN.md                     ← the master phased plan (per-phase targets + exit criteria)
├── README.md                   ← you are here
├── vitest.deep.config.ts       ← dedicated Vitest config (defines both tiers)
├── .env.test                   ← test environment (presets ServerPort, database, oauthkey, …)
├── docker-compose.test.yml     ← infra for the integration tier
├── harness/                    ← shared test infrastructure
│   ├── globals.ts              ← installs framework globals (imports src/package/helper.js)
│   ├── setup.ts                ← Vitest setupFile (runs once per test file)
│   ├── app.ts                  ← boot()/shutdown()/expressApp() — real framework (integration)
│   ├── http.ts                 ← HttpClient (supertest wrapper, token capture)
│   ├── mocks.ts                ← mock factories (req/res/next, mongoose, drizzle, socket)
│   └── fixtures/               ← shared test data
├── unit/                       ← TIER 1: mock-first, zero infrastructure (always runs)
│   ├── 01-foundation/   globals, checkout, deep-merge/equal, Base, importSpecifier (per-OS path resolve), Handler, Session, Logger
│   ├── 02-config/       one file per src/config/*.ts + permutations.test.ts (cross-config matrix)
│   ├── 03-errors/       CustomError, Exception, API/Chasi/Socket, logger channels
│   ├── 04-observer/     Event, Listener, Observer emit (sync/async), horizon, Authorize
│   ├── 05-database/     driver registry, drivers, Model.connect, container models
│   ├── 06-routing/      Route/Group/Registry/Endpoint, Collector, Controllers, UserController
│   ├── 07-server-auth/  App, Consumer, jwt driver, Authentication, Auth/TestMode middleware
│   ├── 08-services/     ServicesModule, Provider, Service, service providers
│   ├── 09-modules/      CompilerEngine, ApiSpec (schemas/routers/compile), SdkBuilder
│   └── 10-realtime/     StreamBucket framing, PipeHandler, Pipeline, Storage, NetServer, …
└── integration/                ← TIER 2: opt-in, real infra (DEEP_INTEGRATION=1)
    ├── http-e2e/        boot, routes-users, auth-lifecycle, errors, model-bound-params
    ├── db/              mongo-crud
    ├── sockets/         ws-roundtrip
    ├── cluster/         fork-workers
    └── config-matrix/   server-modes, apispec-toggle, auth-toggle
```

---

## The two tiers

| Tier | Folder | Infra | When it runs |
|------|--------|-------|--------------|
| **Unit** | `unit/**` | none — drivers/IO mocked via `harness/mocks.ts` and per-test stubs | always |
| **Integration** | `integration/**` | MongoDB / Postgres / MySQL / sockets via docker-compose | only when `DEEP_INTEGRATION=1` |

Every integration suite guards itself so the default run stays hermetic:

```ts
const RUN = !!process.env.DEEP_INTEGRATION;
describe.skipIf(!RUN)("integration › boot", () => { /* uses harness/app.ts boot() */ });
```

Optional dependencies (e.g. `ws`) are imported **lazily inside the test body** so the file
still imports — and skips — cleanly where the dep is absent.

---

## Writing tests (conventions)

- **One subsystem per file**, named `<subject>.test.ts`.
- Unit tests import the class under test directly **plus** `../../harness/globals.ts` (which
  installs the framework globals — `checkout`, `Logger`, `Caveat`, `__deepMerge`, path refs —
  without booting the server).
- Globals that are assigned *after* an `await` in `helper.ts` (`__deepEqual`, `__deepMerge`)
  are awaited via the helper's default export in a `beforeAll` before use.
- Prefer the factories in `harness/mocks.ts`; don't hand-roll req/res.
- **Pin actual 4.1.2 behavior.** If a test reveals a bug, capture it with an explicit
  assertion (e.g. `expect(() => …).toThrow()`) or `it.todo` **plus a note** — never bend the
  test to hide the bug. See the discoveries log below.
- Each phase has an **exit criteria** in `PLAN.md`; a phase is "done" only when it's met.

### Gotchas worth knowing

- **`.env.test` presets** `ServerPort=3099`, `database=test`, `oauthkey=chasi-deep-test`,
  `testMode=enabled`, `Log_Level=0`. Config tests that assert *fallback* values delete the
  relevant var first; `Log_Level=0` keeps the framework's writers silent.
- **Config env-permutation pattern:** configs read `process.env` at module-eval time, so
  permutations use `vi.resetModules()` + env mutation, then `await import(...)` the config.
- **Import cycles:** `Collector↔Registry↔Router` and `App↔Consumer↔Handler` are circular.
  Import the *base of the cycle first* (e.g. `Registry` before `Collector`, `App` before
  `Consumer`) or you get `Class extends undefined`.
- **`PipeHandler`** opens fds 3/4 in its constructor (cluster stdio); tests exercise its
  `format()` bound to a real `EventEmitter` instead of constructing it. The framing algorithm
  itself is covered by `StreamBucket`.

---

## Phase coverage

| Phase | Area | Status | Files |
|-------|------|--------|-------|
| 0 | Harness & scaffolding | ✅ | harness/, config, smoke |
| 1 | Foundation, globals, bootstrap | ✅ | `unit/01-foundation` (8) |
| 2 | Config loaders & scenarios | ✅ | `unit/02-config` (10 per-file + `permutations` cross-config matrix) |
| 3 | Errors & exception handling | ✅ | `unit/03-errors` (9) |
| 4 | Observer & events | ✅ | `unit/04-observer` (6) |
| 5 | Database, drivers & models | ✅ | `unit/05-database` (9) |
| 6 | Routing engine & controllers | ✅ | `unit/06-routing` (12) |
| 7 | Server, App, auth & middleware | ✅ | `unit/07-server-auth` (9) |
| 8 | Service providers & lifecycle | ✅ | `unit/08-services` (4) |
| 9 | Modules: Compiler, ApiSpec, SdkBuilder | ✅ | `unit/09-modules` (7) |
| 10 | Realtime, clustering, streams, storage | ✅ | `unit/10-realtime` (7) |
| 11 | Config permutation matrix | ☑ opt-in | `integration/config-matrix` (3) |
| 12 | Full-boot E2E | ☑ opt-in | `integration/http-e2e` + db/sockets/cluster (8) |

Live forking (cluster) and the model-bound-param e2e are reserved as `it.todo` — the bundled
demo api exposes only `/api/users/{signin,signup}`, and fork assertions need a subprocess
harness. The underlying mechanisms are unit-tested in Phases 6, 7 and 10.

---

## Discoveries log (bugs / quirks found, pinned not patched)

These are real behaviors of 4.1.2 captured by tests (with notes) so a future fix flips the
relevant test red:

| Where | Discovery |
|-------|-----------|
| `Handler.ts` | The documented `status` state machine (`off→initializing→instantiating→initialized`) is never wired — only the numeric `_state` is mutated. |
| `helper.ts` `__deepMerge` | Mutates its `target` in place and **replaces** (not element-wise merges) array values. |
| `Exception.setInvoker()` | Crashes when the message is a common substring of the stack (e.g. `"x"`): the line filter empties and `stack.split` throws. |
| `ErrorHandler/loggers/Http.ts` | Empty stub — not a registered ExceptionLogger channel (only database/terminal/textfile). |
| `Endpoint.except()` | Discards its `this.middlewares.filter(...)` result; the middleware list isn't mutated — exclusion is enforced later via `excludeFromMw`. |
| `Registry.sanitizeRoute("/x/")` | Leaves a trailing slash: after stripping the leading slash it re-indexes using the stale original `length`. |
| `Chasi/storage/index.ts` | `class Stomp {}` — an empty placeholder; the real session storage is `Storage.ts`. |
| `Chasi/checks/filewrites.ts` | Only creates the file on a Windows-specific `errno (-4058)`; on POSIX a missing file is not created. |
| `package.json` | Version field still reads `4.0.1` though the merged code is 4.1.2 (the lock here tracks the code/intent). |

---

## Regressions found & fixed

Unlike the pinned quirks above, one issue this suite surfaced was a genuine regression and
was **fixed in the framework** rather than pinned:

| Where | Regression | Fix |
|-------|-----------|-----|
| `Base.ts` dynamic `import()` | v4.1.3 wrapped every dynamic import in `pathToFileURL(_fp).href` to fix the Windows ESM loader error (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). On POSIX this percent-encodes spaces (`%20`) in the resolved path, which Vite's loader (used by Vitest) cannot resolve — so any project whose path contains a space (e.g. `chasi-ts implement/`) failed to load controllers, events, and auth drivers (`Observer.setup()`, `Authentication.createDrivers()`). | Introduced `importSpecifier(p, platform?)` in `Base.ts`: it emits a `file://` URL **only on Windows** (where it's required) and passes the raw absolute path on POSIX. Windows behavior is byte-for-byte identical to v4.1.3. The `platform` arg is injectable so all three OS branches are testable from one host. |

Pinned by `unit/01-foundation/import-specifier.test.ts` — per-OS coverage (macOS / Linux /
Windows): POSIX paths (incl. spaces) pass through raw with no `%20`; Windows drive paths are
transformed into loader-safe, round-trippable `file://` URLs.

> **Caveat:** Node's `pathToFileURL` is bound to the host OS, so a real `C:\…` drive path
> can't be byte-for-byte converted on a non-Windows runner. The Windows cases assert the
> *contract* (a `file://` URL is produced and decodes back to the input); for true on-Windows
> verification, run the unit tier on a `windows-latest` CI job.
