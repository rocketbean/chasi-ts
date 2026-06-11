---
name: vitest
description: Writing and organising Vitest tests in chasi-ts — the Helper class, test module pattern, URL construction, auth flow, mock data, beforeAll reset, and vitest.config.ts conventions. Use when writing, debugging, or extending the test suite.
---

# Vitest Skill (chasi-ts)

## How the test suite is structured

```
test/
├── .env.test          ← test-only env vars (loaded by vitest.config.ts)
├── setup.ts           ← re-exports Helper as `app`
├── helper.ts          ← Helper class: wraps supertest + auth state
├── app.test.ts        ← single entry point; registers all test modules
├── mocks/
│   └── user.json      ← fixture data for test runs
└── tests/
    └── routes.test.ts ← individual test module (excluded from auto-discovery)
```

**Key rule:** `test/tests/` is excluded from Vitest auto-discovery (`exclude: ["test/tests"]` in `vitest.config.ts`). Test files there are **imported manually** from `app.test.ts`, not picked up automatically. Every new test module must be registered there.

---

## vitest.config.ts — what matters

```ts
export default defineConfig({
  test: {
    globals: true,                                   // describe/test/expect are global
    environment: "node",
    testTimeout: 20000,                              // 20s per test — DB calls are slow
    env: loadEnv("test", process.cwd() + "/test", ""), // loads test/.env.test
    exclude: ["dist", "node_modules", "src", "test/tests"],
  },
});
```

- **`globals: true`** — `describe`, `test`, `expect`, `beforeAll`, `afterAll` are available without importing, but explicit imports are still fine and preferred for clarity.
- **`testTimeout: 20000`** — don't lower this; the server boot + DB connection takes several seconds.
- **`env`** — test env is loaded from `test/.env.test`, not the root `.env`. Add test-specific vars there.

---

## test/.env.test — test environment

```ini
testMode=enabled         # activates TestMode middleware (allows destructive ops like /forget)
environment=local
database=dev
ServerPort=3013          # test server runs on a different port from dev
oauthkey=chasi
dbConStringDev=mongodb://localhost:27017/
dbConStringTest=mongodb://localhost:27017/
```

- `testMode=enabled` is required — the `TestMode.mw` middleware guards destructive routes like `/forget`. Without it those routes are blocked.
- `ServerPort=3013` separates the test server from the dev server.

---

## The Helper class (`test/helper.ts`)

`Helper` wraps `supertest` and tracks auth state. Never use `supertest` directly in tests — always go through `$app.send()`.

```ts
// constructor options
new Helper({
  basePath: "/api",           // prepended to every url in send() unless raw: true
  signinUrl: "/api/users/signin",
})

// send a request
await $app.send({
  url: "/users/signup",       // combined with basePath → /api/users/signup
  method: "post",
  data: { name, email, alias, password },
  raw: false,                 // false (default): prepends basePath. true: uses url as-is
  logUrl: true,               // prints "[post]: /api/users/signup" to console
})

// authenticate — stores token in $app.auth.token
// all subsequent send() calls auto-include Authorization header
await $app.authenticate({ email: "test@test.com", password: "securepass" })

// access stored auth
$app.auth.user   // user object from signin response
$app.auth.token  // JWT string
```

`Helper.getApp()` returns `instance.$app.$server` (the Express app) — the same instance the server booted with.

---

## app.test.ts — entry point pattern

```ts
import { describe, beforeAll } from "vitest";
import { app } from "./setup.ts";
import routesTest from "./tests/routes.test.ts";
import usersTest from "./tests/users.test.ts";   // add new modules here

describe("App Test running", async () => {
  let $app = new app({
    basePath: "/api",
    signinUrl: "/api/users/signin",
  });

  beforeAll(async () => {
    // Give the server time to finish booting before tests run
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  // Register test modules in execution order
  // Tests share $app — auth state carries across modules
  await routesTest($app);
  await usersTest($app);
});
```

- The 2-second `beforeAll` delay lets the server and DB connections fully initialise.
- Test modules run sequentially — later modules can rely on state (e.g. a user created by an earlier module).

---

## Writing a test module (`test/tests/`)

Each module exports a default async function receiving `$app`:

```ts
// test/tests/properties.test.ts
import { describe, test, expect, beforeAll } from "vitest";
import App from "../helper.ts";

export default async ($app: App) => {
  describe("Properties", async () => {

    // Clean slate before this group runs
    beforeAll(async () => {
      // Reset only what this module touches — don't drop unrelated collections
      await $app.send({ url: "/properties/reset", method: "post" });
    });

    describe("POST /properties", () => {
      test("creates a property and returns 200", async () => {
        const res = await $app.send({
          url: "/properties",
          method: "post",
          data: { name: "Sunset Tower", code: "ST001" },
        });
        if (res.statusCode !== 200) console.error("[create property]", res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
      });

      test("rejects duplicate code", async () => {
        const res = await $app.send({
          url: "/properties",
          method: "post",
          data: { name: "Other", code: "ST001" },
        });
        expect(res.statusCode).toBe(400);
      });
    });

    describe("GET /properties", () => {
      test("returns a list", async () => {
        const res = await $app.send({ url: "/properties", method: "get" });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

  });
};
```

Then register it in `app.test.ts`:
```ts
import propertiesTest from "./tests/properties.test.ts";
// ...
await propertiesTest($app);
```

---

## URL construction rules

`basePath` is prepended to `url` in `send()` unless `raw: true`:

```ts
// Helper({ basePath: "/api" })

$app.send({ url: "/users/signup", method: "post" })
// → hits /api/users/signup

$app.send({ url: "/some-other-path", method: "get", raw: true })
// → hits /some-other-path (no basePath)

$app.send({ url: "/unknown", method: "get" })
// → hits /api/unknown  →  expect 404
```

If your module uses a sub-path (e.g. `/api/users`), create a scoped helper:

```ts
// In app.test.ts or the module itself
const userApp = new app({ basePath: "/api/users", signinUrl: "/signin" });
```

---

## Auth in tests

```ts
// 1. Create the user first
await $app.send({
  url: "/users/signup",
  method: "post",
  data: { name: "Test", email: "test@test.com", alias: "tester", password: "securepass" },
});

// 2. Authenticate — stores token in $app.auth.token
await $app.authenticate({ email: "test@test.com", password: "securepass" });

// 3. All subsequent $app.send() calls include "Authorization: <token>" automatically

// 4. Verify a protected route is accessible
const res = await $app.send({ url: "/protected-route", method: "get" });
expect(res.statusCode).toBe(200);
```

- The token format stored is a raw JWT string. `Authorization` header is set as-is.
- Auth state persists for the lifetime of the `$app` instance — shared across test groups.

---

## Resetting state between tests

Use `beforeAll` (not `beforeEach`) to reset — wiping the DB before every test is too slow.

```ts
beforeAll(async () => {
  // Drop and repopulate
  await $app.send({ url: "/forget", method: "post" });  // protected by TestMode.mw
  // Then seed what this suite needs
  await $app.send({ url: "/users/signup", method: "post", data: seedUser });
});
```

`/forget` calls `this.user.collection.drop()` in `UserController` and is guarded by the `testmode` middleware — it only works when `test/.env.test` has `testMode=enabled`.

---

## Mock data (`test/mocks/`)

Store fixture JSON in `test/mocks/`. Import with a type assertion:

```ts
import * as userMock from "../mocks/user.json";
const users = userMock.data;  // typed as any[]
```

Keep mocks minimal — only the fields the test actually needs. Don't couple mocks to the full model shape.

---

## Assertions — common patterns

```ts
// Status codes
expect(res.statusCode).toBe(200);
expect(res.statusCode).not.toBe(200);

// Response shape
expect(res.body).toHaveProperty("token");
expect(res.body).toHaveProperty("user");
expect(Array.isArray(res.body)).toBe(true);

// Debug failed assertion (log before expect so the output is visible)
if (res.statusCode !== 200) console.error("[label]", res.statusCode, res.body);
expect(res.statusCode).toBe(200);

// Error responses — check status, not message text (messages can change)
expect(res.statusCode).toBe(422);
expect(res.statusCode).toBe(400);
expect(res.statusCode).toBe(401);
```

---

## Running tests

```bash
npm run test                                # run all tests (app.test.ts only)
npx vitest run test/app.test.ts             # explicit single-file run
npx vitest --reporter=verbose               # detailed output per test
npx vitest run test/app.test.ts 2>&1 | head -80  # cap noisy output
```

`test/tests/*.test.ts` files are never run directly — always via `app.test.ts`.

---

## Adding a new test module — checklist

1. Create `test/tests/myfeature.test.ts` exporting `async ($app: App) => { describe(...) }`
2. Import and register in `app.test.ts`: `await myfeatureTest($app)`
3. Add any new fixture data to `test/mocks/`
4. Add any new test-only env vars to `test/.env.test`
5. If the module needs a clean slate, add a `beforeAll` reset using a `testmode`-guarded route
