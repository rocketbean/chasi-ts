# chasi-ts &nbsp;`v4.x.x`

A TypeScript MVC framework for Node.js, built on Express. Chasi autoloads controllers, models, routes, and services at startup, wiring them together through a structured lifecycle — so you focus on your application logic, not the boilerplate.

- **npm** — https://www.npmjs.com/package/@rocketbean/chasi-ts
- **CLI** — https://www.npmjs.com/package/@rocketbean/create-chasi-ts
- **GitHub** — https://github.com/rocketbean/chasi-ts
- **Chasi-ts Docs** — https://chasi-ts.com
OR
> **Docs** — full interactive documentation is served locally. Start the server and open `http://localhost:3010` in your browser.

---
## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [CLI](#cli)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Routing](#routing)
- [Database](#database)
- [Observer & Events](#observer--events)
- [Drizzle ORM](#drizzle-orm)
- [Authentication](#authentication)
- [Testing](#testing)
- [CompilerEngine](#compilerengine)
- [API Spec](#api-spec)
- [SDK Builder](#sdk-builder)
- [Release Notes](#release-notes)

---

## Requirements

| Tool | Minimum version |
|------|----------------|
| Node.js | `>=20.19.0` |
| NPM | `>=8.0.0` |
| Git | `>=2.0.0` |

---

## Installation

**via npm init (recommended)**
```bash
npm init @rocketbean/chasi-ts
```

**via chasi-cli**
```bash
npm i -g @rocketbean/create-chasi-ts
chasi init
```

**via GitHub**
```bash
git clone https://github.com/rocketbean/chasi-ts.git
cd chasi-ts
npm install
```

---

## Getting Started

1. Copy the environment template and fill in your values:
   ```bash
   cp template.env .env
   ```

   Key variables:
   ```env
   APP_NAME=CHASI
   ServerPort=3010-3020   # range — tries 3010 first, falls back through 3020
   # ServerPort=3010       # single port
   # ServerPort=3010,3011,3012  # explicit list
   environment=local

   # Database — selects the active "dev" connection (see src/config/database.ts)
   database=dev
   devDatabaseName=devdb
   dbConStringDev=mongodb://localhost:27017/

   # Auth
   oauthkey=chasi
   ```

2. Start the development server:
   ```bash
   npm run dev          # TypeScript watch + auto-restart
   npm run dev:html     # also hot-reloads HTML/CSS/JS (nodemon)
   ```

3. Open `http://localhost:3010` — the API is live and the built-in docs are served from the same port.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch-mode TypeScript compile + auto-restart server |
| `npm run dev:html` | Same as above, also watches HTML/CSS/JS via nodemon |
| `npm run start` | Compile TypeScript and run the production server |
| `npm run test` | Run the Vitest test suite |

TypeScript compiles to `dist/` (ES modules — `NodeNext`, ESNext target). The `postbuild` step automatically copies HTML templates from `src/container/html/` to `dist/container/html/`.

---

## CLI

Install the Chasi CLI globally or use it via `npx`:

```bash
npm i -g @rocketbean/create-chasi-ts
# or use npx chasi <command>
```

### Create a Controller
```bash
chasi create -c User
# → src/container/controllers/UserController.ts
```

Reference in your route namespace:
```ts
route.group({ prefix: "user", controller: "@UserController" }, () => {
  route.post("/", "create");
  route.get("/", "list");
  route.get("/:id", "index");
  route.patch("/:id", "update");
  route.delete("/:id", "delete");
});
```

### Create a Model
```bash
chasi create -m User
# → src/container/models/User.ts
```

Access registered models inside any controller:
```ts
get user() {
  return this.models.user;
}
```

### Create a Service Provider
```bash
chasi create -p MyServiceProvider
# → src/container/services/MyServiceProvider.ts
```

Register it in `src/config/container.ts` under `ServiceBootstrap` to have it auto-initialized at boot:
```ts
ServiceBootstrap: {
  myservice: "container/services/MyServiceProvider",
}
```

### Create a Middleware
```bash
chasi create -w AuthMiddleware
# → src/container/middlewares/AuthMiddleware.ts
```

Register it in `src/config/container.ts` under `middlewares`:
```ts
middlewares: {
  auth: "./container/middlewares/AuthMiddleware",
}
```

Then attach it in a route:
```ts
route.post("yourpath", "Controller@method").middleware("auth");
// or at the group level:
route.group({ prefix: "protected", middleware: "auth" }, () => { ... });
```

---

## Architecture

```
src/server.ts
  → helper.ts          (globals: checkout(), Logger, path refs)
  → Base.Ignition()    (load all config files and modules)
  → Session.initialize(handler)
      → service providers, models, middlewares, DB connections, auth
  → Handler boots Express (App.ts), wires routes and listeners
```

### Key directories

| Path | Purpose |
|------|---------|
| `src/config/` | App-level config: server, database, auth, compiler, exceptions |
| `src/container/controllers/` | Route handlers — extend base `Controller` |
| `src/container/models/` | Mongoose schemas — extend base `Model` |
| `src/container/services/` | Service providers (Router, Socket, Compiler, ApiSpec, SdkBuilder) |
| `src/container/modules/ApiSpecs/` | OpenAPI spec generation module |
| `src/container/modules/SdkBuilder/` | JavaScript SDK bundle generation module |
| `src/container/middlewares/` | Custom middleware |
| `src/container/http/` | Route definitions (`api.ts`, `chasi.ts`) |
| `src/package/framework/` | Core framework internals |
| `src/package/statics/` | Base classes: `Router`, `Controller`, `Model`, `Authorization` |
| `test/` | Vitest tests using supertest |

### Bootstrap sequence — state machine

| State | Description |
|-------|-------------|
| `initializing` | Observer module setup, data collection, service provider registration |
| `instantiating` | DB connections, router consumption, middleware and controller loading |
| `initialized` | Error container check, module instantiation, server ready |

---

## Configuration

All config files live in `src/config/` and are fully TypeScript-typed. Key files:

| File | Type | Description |
|------|------|-------------|
| `server.ts` | `serverConfig` | Port, environment, CORS, clustering, lifecycle hooks |
| `database.ts` | `DatabaseConfig` | Named DB connections, default connection, model directories |
| `authentication.ts` | `AuthenticationConfig` | JWT driver configuration, auth exceptions |
| `container.ts` | `ContainerConfig` | App name, controller directory, service providers, middlewares |
| `compiler.ts` | `CompilerEngineConfig` | Vite SSR engine configuration |
| `exceptions.ts` | `ExceptionsConfig` | Error log destination, exception registry, default HTTP responses |
| `observer.ts` | `ObserverConfig` | Event registry, global `beforeEmit`/`afterEmit` hooks |
| `apispec.ts` | `ApiSpecConfig` | OpenAPI spec output, schema filters, security, components |
| `sdkbuilder.ts` | `SdkBuilderConfig` | SDK output path, host, HTTP client, route filters, formatter |

### Port selection

`serverConfig.port` accepts three forms. When the chosen port is already in use the runtime tries the next candidate in order until one succeeds.

```ts
// single port
port: 3010

// explicit list — tried in order
port: [3010, 3011, 3012]

// inclusive range
port: { start: 3010, end: 3020 }
```

`ServerPort` in `.env` overrides the config and supports the same three notations as a string:

```env
ServerPort=3010          # single
ServerPort=3010-3020     # range
ServerPort=3010,3011,3012 # list
```

Once the server binds successfully, `process.env.ServerPort` and `global.__basepath` are updated to reflect the actual port.

### Environment modes

`src/config/server.ts` supports named server modes (e.g. `local`, `dev`) each with their own protocol and SSL cert paths. Set `environment` to switch between them:

```ts
environment: checkout(process.env.environment, "local"),
modes: {
  local: { key: null, cert: null, protocol: "http" },
  dev:   { key: checkout(process.env.devKey), cert: checkout(process.env.devCert), protocol: "https" },
}
```

### Service Clustering

Enable Node.js cluster mode in `src/config/server.ts`:

```ts
serviceCluster: {
  enabled: true,
  workers: Math.round(os.cpus().length / 2),
  schedulingPolicy: 2, // 1 = OS default, 2 = round-robin
}
```

**How it works**

The primary process forks `workers` child processes. All workers share the same port (handled by the OS or the Node.js round-robin scheduler). Only the **lead worker** (the first forked) forwards structured log sections (DATABASE, BOOT, SERVICES, ROUTE REGISTRY) to the primary's terminal dashboard — non-lead workers only forward unhandled exceptions, keeping the display clean. When any worker crashes and restarts, it inherits the same lead/non-lead role as the process it replaces.

**Terminal dashboard in cluster mode**

Each worker produces formatted log output using the primary's terminal width, which is injected as `TERM_COLS` at fork time (workers have no TTY of their own). The dashboard redraws on every new log entry and on terminal resize.

**Graceful shutdown**

On `SIGTERM` or `SIGINT` the primary calls `worker.disconnect()` on each worker, giving in-flight requests up to 5 seconds to complete before `process.exit(0)`. To trigger a clean shutdown programmatically:

```bash
kill -TERM <primary-pid>
```

**Using `compiler` alongside `serviceCluster`**

Both modules can be enabled at the same time. Workers automatically skip the Vite engine setup — only the primary process initialises the compiler. Set the compiler `environment` to `"prod"` for production cluster deployments:

```ts
// src/config/compiler.ts
environment: "prod",
```

> Running the compiler in `"dev"` (Vite HMR) mode while `serviceCluster` is active is not recommended — Vite's dev server is not designed for multi-process use.

---

## Routing

Routes are defined in `src/container/http/` and registered through named routers in `src/container/services/RouterServiceProvider.ts`.

```ts
// src/container/http/api.ts
import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  route.group({ prefix: "users", controller: "@UserController" }, () => {
    route.get("/", "list");
    route.post("/", "create");
    route.get("/:id", "index");
    route.patch("/:id", "update");
    route.delete("/:id", "delete");
  });
};
```

Each router is configured via `RouterConfigInterface`:

```ts
{
  name: "api",
  auth: "dev",           // auth driver name, or false/null to disable
  prefix: "/api",
  namespace: "container/http/api",
  middleware: [],
  ControllerDir: "container/controllers",
}
```

---

## Database

Chasi supports **MongoDB**, **Prisma**, and **Drizzle ORM**. All connections are declared in `src/config/database.ts` and connected automatically at boot.

```ts
connections: {
  local: {
    driver: "mongodb",
    url: process.env.dbConStringLocal,
    db: process.env.databaseName,
    options: { connectTimeoutMS: 4000, socketTimeoutMS: 4000 },
  },
}
```

Use `$getConnection("connectionName")` inside a controller to switch connections at runtime; falls back to the `default` connection if the name doesn't exist.

> **Design note:** chasi follows a *uniform plumbing, native queries* model — it manages connections/lifecycle uniformly across drivers, but you query each store with its native API (Mongoose models, `Model.prisma()`, `Model.drizzle()`). The Mongoose integration (`Model.connect`, `this.models`) is a Mongoose-specific convenience. The roadmap for a more uniform driver contract is in [`docs/rfc/0001-database-uniformity.md`](docs/rfc/0001-database-uniformity.md).

---

## Observer & Events

Chasi includes an async **Observer** event bus. A single instance is created at boot from `src/config/observer.ts` and exposed as `$observer` on the app `Handler` and on every controller via `this.$observer`.

### What the Observer does

- Loads and registers **custom Event classes** listed in config (`Observer.setup()` at startup)
- Dispatches events through an `AsyncEventEmitter` with a fixed pipeline: `validate` → `onemit` → `fire` → `fireListeners` → `emitted`
- Orchestrates **framework lifecycle** during boot (`__before__`, `__initialize__`, `__after__`, `__boot__`, `__ready__`, `__exception__`) — these Horizon events live under `src/package/statics/horizon/events/` and are not listed in `observer.ts`

### Registering custom events (required)

A custom event **must** be declared in `src/config/observer.ts` under `events` before you can use it. At boot, `Observer.setup()` reads that map, loads each class from `src/container/events/` (or your path), and registers the alias on the emitter. If an alias is missing from config, `emit("thatAlias")` will not run your handler.

```ts
events: {
  authorized: "container/events/Authorize", // required — alias → path relative to src/
},
```

### How events run (isolated from the request)

Event work runs on the async emitter, **not on the Express request/response stack**. In a controller:

- **Fire-and-forget** (typical for side effects): `this.$observer.emit("authorized", { ... })` **without** `await` — the handler can call `res.json()` and the client gets a response while the event pipeline still runs.
- **Wait for completion**: `await this.$observer.emit(...)` — use when the response must not be sent until the event finishes.

Once detached (no `await`), a failure inside `fire()` does not change an HTTP status code that was already sent; handle errors inside the event or use `await` when the client must wait.

### Configuration (`src/config/observer.ts`)

Typed as `ObserverConfig` from `src/package/Observer/index.ts`:

| Property | Type | Description |
|----------|------|-------------|
| `events` | `events` (`Record<string, string>`) | Maps event alias → class path relative to `src/` (no extension) |
| `beforeEmit` | `Function` | Global hook before `fire()`; `this` is the Event instance |
| `afterEmit` | `Function` | Global hook after `fire()` and listeners; skipped if the event overrides `emitted` |

```ts
// src/config/observer.ts
export default <ObserverConfig>{
  events: {
    authorized: "container/events/Authorize",
  },
  beforeEmit: async function (params) { /* runs before every event's fire() */ },
  afterEmit: async function (params) { /* runs after fire() + listeners */ },
};
```

### Custom Event classes

Create a class under `src/container/events/` that extends `Event` and implements `EventInterface`:

```ts
import Event, { EventInterface } from "../../package/Observer/Event.js";

export default class Authorize extends Event implements EventInterface {
  async validate(params, next) {
    next(); // required — or throw to abort
  }
  async fire(params) {
    // side effects: audit, notify, etc.
  }
}
```

### Emitting and listening

```ts
// Inside a controller method(request, response). Controllers RETURN the body —
// the Consumer serializes it; there is no this.res.json(). The authenticated
// user is on request.auth (set by the JWT driver), not req.user.
this.$observer.emit("authorized", { userId: request.auth.user._id });
return { ok: true };

// Or block until the event completes
await this.$observer.emit("authorized", { userId: request.auth.user._id });

// In a service provider — subscribe to lifecycle or custom events
Provider.$observer.when("__ready__", async (_prop, params) => {
  Logger.info("Server ready", params.server?.address());
});
```

> Full interactive docs for Observer and Events are in the built-in documentation UI (sidebar **Observer**) when you run `npm run dev` and open `http://localhost:3010`.

---

## Drizzle ORM

Chasi has a first-class Drizzle driver that supports PostgreSQL, MySQL, SQLite, and Turso. Drizzle connections live alongside MongoDB/Prisma connections in the same `src/config/database.ts` file.

### 1. Install the peer package for your database

| Database | Adapter string | Package to install |
|----------|---------------|--------------------|
| PostgreSQL | `"node-postgres"` | `npm i pg @types/pg` |
| PostgreSQL (postgres.js) | `"postgres-js"` | `npm i postgres` |
| MySQL | `"mysql2"` | `npm i mysql2` |
| SQLite | `"better-sqlite3"` | `npm i better-sqlite3 @types/better-sqlite3` |
| Turso / libSQL | `"libsql"` | `npm i @libsql/client` |

`drizzle-orm` itself is already included in the project dependencies.

### 2. Define a schema

Create a schema file at `src/container/drizzle/schema.ts`. Export each table as a named export — do **not** use a default export.

```ts
// src/container/drizzle/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authorId: serial("author_id").references(() => users.id),
});
```

Use the matching import path for your database dialect:

| Database | Import path |
|----------|------------|
| PostgreSQL | `drizzle-orm/pg-core` |
| MySQL | `drizzle-orm/mysql-core` |
| SQLite | `drizzle-orm/sqlite-core` |

### 3. Register the connection in `src/config/database.ts`

```ts
connections: {
  // existing MongoDB connections...
  local: { driver: "mongodb", ... },

  // Drizzle PostgreSQL connection
  pg: {
    driver: "drizzle",
    url: process.env.PG_URL,  // "postgresql://user:pass@localhost:5432/mydb"
    options: {
      adapter: "node-postgres",
      schema: "./container/drizzle/schema",  // path relative to src/
    },
  },
}
```

Add the connection URL to your `.env`:
```env
PG_URL=postgresql://user:pass@localhost:5432/mydb
```

### 4. Add the migration setup (optional but recommended)

Create a `drizzle.config.ts` in the project root to use Drizzle Kit for migrations:

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/container/drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.PG_URL!,
  },
});
```

Install Drizzle Kit and add a migration script:
```bash
npm i -D drizzle-kit
```

```json
// package.json scripts
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:studio":   "drizzle-kit studio"
```

### 5. Query from a controller

Once the connection is registered, two access patterns are available:

**Via `this.models`** (recommended inside controllers):
```ts
import Controller from "../../package/statics/Controller.js";
import { eq } from "drizzle-orm";

export default class UserController extends Controller {

  // Convenience getter — this.models.pg._db is the live Drizzle client
  get db() {
    return this.models.pg._db;
  }

  // this.models.pg.users is the table definition from the schema file
  get users() {
    return this.models.pg.users;
  }

  async list(request, response) {
    return await this.db.select().from(this.users);
  }

  async index(request, response) {
    const [user] = await this.db
      .select()
      .from(this.users)
      .where(eq(this.users.id, Number(request.params.id)));
    return user;
  }

  async create(request, response) {
    const [created] = await this.db
      .insert(this.users)
      .values(request.body)
      .returning();
    return created;
  }

  async update(request, response) {
    const [updated] = await this.db
      .update(this.users)
      .set(request.body)
      .where(eq(this.users.id, Number(request.params.id)))
      .returning();
    return updated;
  }

  async delete(request, response) {
    await this.db
      .delete(this.users)
      .where(eq(this.users.id, Number(request.params.id)));
    return { deleted: true };
  }
}
```

**Via `Model.drizzle()`** (useful outside a controller, e.g. in a service or event):
```ts
import Model from "../../package/statics/Model.js";
import { users } from "../drizzle/schema.js";

const db = Model.drizzle("pg");
const allUsers = await db.select().from(users);
```

### MySQL and postgres-js (client-based adapters)

These adapters require a pre-built client passed through `globals.client` because they do not accept a bare connection string:

```ts
// src/config/database.ts
import mysql from "mysql2/promise";

const mysqlConnection = await mysql.createConnection({
  uri: process.env.MYSQL_URL,
});

connections: {
  mysql: {
    driver: "drizzle",
    url: process.env.MYSQL_URL,
    options: {
      adapter: "mysql2",
      schema: "./container/drizzle/schema",
      globals: { client: mysqlConnection },
    },
  },
}
```

### SQLite example

```ts
connections: {
  sqlite: {
    driver: "drizzle",
    url: "./data/app.db",   // file path, or ":memory:" for in-memory
    options: {
      adapter: "better-sqlite3",
      schema: "./container/drizzle/schema",
    },
  },
}
```

---

## Authentication

JWT authentication is configured per-router driver in `src/config/authentication.ts`. The resolved user document is attached to `request.auth` on every protected request.

Exempt specific routes from the auth guard:
```ts
AuthRouteExceptions: [
  { url: "/api/users/signin", m: "post" },
  { url: "/api/users/signup", m: "post" },
]
```

---

## Testing

Tests use [Vitest](https://vitest.dev/) and [supertest](https://github.com/ladjs/supertest). Place test files in `test/` with a `.test.ts` suffix.

```bash
npm run test                          # run all tests
npx vitest run test/app.test.ts       # run a single file
```

Set up a dedicated test environment file at `test/.env.test`:
```env
NODE_ENV=test
CHASI_COMPILER=false
environment=local
ServerPort=3010
database=test
testDatabaseName=mydb_test
dbConStringTest=mongodb://localhost:27017/
```

> **Deprecated (v4.2.0):** the old `testMode=enabled` flag is removed. It was
> overloaded — it both skipped the Vite compiler and switched module resolution
> to `.ts`. It is replaced by two clear signals: `CHASI_COMPILER=false` skips the
> compiler, and `NODE_ENV=test` enables test-only behavior (Vitest sets this
> automatically). Module resolution is now auto-detected from disk, so no flag is
> needed for that. See **Release Notes → v4.2.0**.

Configure `vitest.config.ts` to load it:
```ts
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: loadEnv('test', process.cwd() + "/test", ""),
    exclude: ['dist/*', 'node_modules'],
    passWithNoTests: true,
  },
})
```

> Compiler engines are skipped when the compiler is disabled — set `CHASI_COMPILER=false` (test envs do this) or `compiler.enabled = false` for API-only servers.

---

## CompilerEngine

The `CompilerEngine` module integrates [Vite](https://vitejs.dev/) SSR into Chasi, letting you colocate a Vue, React, or any Vite-compatible frontend alongside your API. Each entry in the `engines` array maps a Vite project to an Express router prefix and handles both `"dev"` (HMR) and `"prod"` (static build + SSR renderer) modes.

Configure it in `src/config/compiler.ts`:

```ts
import { CompilerEngineConfig, Builder } from "../container/modules/compilerEngine/compiler.js";

let environment: "dev" | "prod" = "prod";

const config: CompilerEngineConfig = {
  enabled: true,
  engines: [
    {
      name: "web",                              // must match router.mount() prop
      environment,                              // "dev" = HMR | "prod" = static build
      root: join(dirpath, "container/html/web"),
      ssrServerModule: "entry-server.js",       // filename in .out/server/ (output ext, not source)
      serverBuild: {
        outDir: "./.out/server",
        emptyOutDir: true,
        ssr: "./entry-server.js",               // source entry for SSR bundle
      },
      clientBuild: {
        outDir: "./.out/client",
        emptyOutDir: true,
        manifest: true,
        ssrManifest: true,
      },
      configPath: resolve(join(dirpath, "container/html/web/ssr.config.js")),
      mountedTo: "/pub",                        // MUST match the router prefix
      hook: async (getConfig, ctx) => {
        if (environment === "prod") await Builder.distribute(ctx.root);
        await Builder.prodSetup(getConfig, ctx);
      },
    },
  ],
};
```

### `CompilerEngineConfig`

| Property | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Master switch. Set `false` for API-only servers with no frontend. Defaults to `true` unless `CHASI_COMPILER=false` (test envs set this to skip the build). |
| `engines` | `builderConfig[]` | One entry per Vite project. All engine hooks run in parallel via `Promise.all` during `server.hooks.beforeApp`. |

### `builderConfig` — per-engine options

| Property | Type | Description |
|---|---|---|
| `name` | `string` | Unique name. Must match the first element of `props` passed to `router.mount()` in `RouterServiceProvider`. |
| `environment` | `"dev" \| "prod"` | `"dev"` starts Vite's dev server with HMR. `"prod"` runs a full Vite build and serves static output. |
| `root` | `string` | Absolute path to the Vite project directory containing `ssr.config.js` and `index.html`. |
| `ssrServerModule` | `string` | Filename of the compiled SSR entry inside `.out/server/`. Vite compiles `.jsx`/`.tsx` → `.js`, so this must use the **output** extension — `"entry-server.js"` even when the source is `entry-server.jsx`. |
| `serverBuild` | `vite.BuildOptions` | Vite build options for the Node.js SSR bundle. `ssr` is the source entry path. |
| `clientBuild` | `vite.BuildOptions` | Vite build options for the browser bundle. `manifest: true` and `ssrManifest: true` are required for asset URL injection into SSR HTML. |
| `configPath` | `string` | Absolute path to the Vite config file. Using a dedicated `ssr.config.js` isolates SSR options from any client-only config. |
| `mountedTo` | `string` | **Must exactly match the `prefix` of the router this engine is mounted on.** Chasi passes `mountedTo` as Vite's `base` option at build time — it is baked into every asset URL in compiled HTML/JS. A mismatch causes all CSS, JS, and image assets to 404 at runtime. |
| `hook` | `Function` | Called during `server.hooks.beforeApp`. Typically `Builder.distribute(ctx.root)` (prod only) then `Builder.prodSetup(getConfig, ctx)`. Runs on the primary process only — not per worker. |

### `ssr.config.js` requirements

The config file **must** export a **function** (not a plain object):

```js
// ✅ correct — Builder.getConfigs() calls the default export as a function
export default defineConfig(() => ({
  plugins: [vue()],
  appType: "custom",
  server: { middlewareMode: true },
}));

// ❌ wrong — returns an object, not a callable; throws TypeError: .default is not a function
export default defineConfig({
  plugins: [vue()],
});
```

### Dev vs prod

| Mode | Behaviour |
|------|-----------|
| `"dev"` | `vite.createServer()` — HMR active, no build step, source served directly. **Not safe with `serviceCluster`**. |
| `"prod"` | `vite.build()` for both server and client bundles, then serves compiled output as static files. Use for CI, staging, and all cluster deployments. |

Switch modes by changing `environment` at the top of `src/config/compiler.ts`.

### Multiple engines

Declare multiple entries in `engines`. All hooks run in parallel. Each engine needs a unique `name` and a distinct `mountedTo` prefix. Make each project self-contained — if two engines share files via aliases and both call `Builder.sanitize()`, one engine's cleanup can delete files the other engine still needs during the parallel build.

### Compiler + `serviceCluster`

Both can be enabled simultaneously (**v4.1.0+**). Workers skip Vite setup via a `cluster.isWorker` guard — only the primary process initialises the compiler. Always use `environment: "prod"` in cluster deployments; Vite's HMR server is not multi-process safe.

---

## API Spec

The `ApiSpec` module auto-generates an **OpenAPI 3.x** JSON spec file on every server boot. It collects model schemas from all active database connections and route definitions from registered routers.

### Enable

`ApiSpecServiceProvider` is already registered in `ServiceBootstrap`. Configure it in `src/config/apispec.ts`:

```ts
import type { ApiSpecConfig } from "../container/modules/ApiSpecs/ApiSpec.types.js";

export default <ApiSpecConfig>{
  enabled: true,
  output: { filename: "api.spec.json", pretty: true },
  definition: {
    openapi: "3.0.0",
    info: { title: "My API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3010" }],
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  schemas: {
    keyFormat: "prefixed",              // test:user, pg:properties, mysql:User
    drivers: { exclude: ["test"] },     // skip the test DB entirely
    models: { pg: { exclude: ["users", "userApps"] } },
  },
};
```

### Annotate routes

Add a `spec` option to any route. Only annotated routes appear in the output:

```ts
route.post("/signup", "v1/UserController@create", {
  spec: {
    summary: "Register a new user",
    security: [],   // public route — no JWT
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name:     { type: "string" },
              email:    { type: "string", format: "email" },
              password: { type: "string", format: "password", minLength: 6 },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Created user", content: { "application/json": { schema: { $ref: "#/components/schemas/test:user" } } } },
      400: { description: "Email already exists" },
    },
  },
});
```

Tags are auto-derived from the enclosing `route.group` prefix (e.g. `/users` → `"Users"`). Auth is auto-resolved from `AuthRouteExceptions` — public routes get `security: []` automatically.

### Schema key formats

| Setting | Example key | `$ref` |
|---|---|---|
| `keyFormat: "plain"` | `user` | `#/components/schemas/user` |
| `keyFormat: "prefixed"` | `test:user` | `#/components/schemas/test:user` |

---

## SDK Builder

The `SdkBuilder` module generates a **JavaScript SDK bundle** from your registered routes, ready to be consumed by a frontend or mobile app with no extra tooling.

### Enable

`SdkBuilderServiceProvider` is already registered in `ServiceBootstrap`. Configure it in `src/config/sdkbuilder.ts`:

```ts
import type { SdkBuilderConfig } from "../container/modules/SdkBuilder/SdkBuilder.types.js";
import { terserFormatter } from "../container/modules/SdkBuilder/formatters/terser.js";

export default <SdkBuilderConfig>{
  enabled: true,
  host: `http://localhost:${checkout(process.env.ServerPort, "3010")}`,
  output: {
    filename: "sdk/chasi.sdk.js",
    formatter: terserFormatter,   // minify + mangle via terser (default)
  },
  httpClient: "fetch",            // "fetch" (default) or "axios"
  routers: ["api"],               // which routers to include
  exclude: [
    { m: "post", url: "/api/users/forget" },
  ],
};
```

### Add validation with `.sdk()`

Register validation handlers on a route, group, or router. They run in two phases:

1. **Build time** — called during `SdkBuilder.compile()` with a `SdkBuildContext` to validate route configuration
2. **Client side** — serialised as inline functions in the generated bundle and executed before every HTTP request

```ts
// Route-level
route.post("/signin", "v1/UserController@signin", { spec: { ... } })
  .sdk((params, next) => {
    if (!params?.email) throw new Error("email is required");
    next();
  });

// Array of handlers
route.post("/signup", "v1/UserController@create", { spec: { ... } })
  .sdk([validateEmail, validatePassword]);

// Group-level — applied to all routes in the group
route.group({ prefix: "/users", sdk: [validateScope] }, () => {
  route.post("/signin", ...);
  route.post("/signup", ...);
});

// Router-level — applied to every route in the router
new Router({ name: "api", sdk: [validateApiVersion], ... })
```

Execution order per route: **router sdk → group sdk → route sdk → HTTP request**.

> sdk() handlers are cleared from endpoints after compilation — they never run during normal server operation.

### Generated bundle

The output is an ES module grouped by route namespace:

```js
// sdk/chasi.sdk.js (generated)
export const users = {
  /** POST /api/users/signin · public · sdk() validated */
  signin: async (payload = {}) => {
    _validate(payload, ["email", "pass"]);
    await _runSdk(payload, [(params, next) => {
      if (!params?.email) throw new Error("email is required");
      next();
    }]);
    return _request("post", "/api/users/signin", payload);
  },
  /** POST /api/users/signup · public */
  signup: async (payload = {}) => { ... },
};
export default { users };
```

### Consuming the SDK

```js
import { users } from "./sdk/chasi.sdk.js";

// Public route
const { user, token } = await users.signin({ email: "a@b.com", pass: "secret" });

// Protected route — pass the JWT
const profile = await users.index({}, token);

// Validation fires before the request
try {
  await users.signup({ name: "Alice" }); // throws: Missing required field "email"
} catch (err) {
  console.error(err.message);
}
```

### Custom formatter

Swap `terserFormatter` for any `(code: string) => string | Promise<string>` function:

```ts
// uglify-js@3
import UglifyJS from "uglify-js";
formatter: (code) => UglifyJS.minify(code).code

// prettier (for readable, formatted output)
import prettier from "prettier";
formatter: (code) => prettier.format(code, { parser: "babel" })

// no formatting — omit the property
```

---

## Release Notes

### v4.2.0
- **Express 5 support.** Upgraded Express 4→5; the framework absorbs the breaking changes so your app code keeps working:
  - **Routing (path-to-regexp v8):** the built-in catch-all routes use the root-matching `/{*splat}`, and `Consumer` auto-translates legacy `"*"` / `"/foo/*"` route paths to the Express-5 named-wildcard form — so a bare `"*"` route no longer throws.
  - **`req.body`:** Express 5 leaves it `undefined` for non-JSON requests; chasi defaults it back to `{}`, keeping controllers that destructure `request.body` on the graceful validation path (e.g. 422) instead of crashing (500).
  - **`express.static` dotfiles:** the default is now `"ignore"`; chasi explicitly serves `/.well-known` (`dotfiles: "allow"`) for Apple/Android app links and ACME challenges, while keeping other dotfiles private.
  - Async errors in controllers/middleware are handled by chasi's own wrapper (controllers never needed `try/catch`); `req.params` typing widened for the new wildcard arrays.
- **⚠️ Deprecation — `testMode` removed.** The `testMode` env flag is gone. It was overloaded across four unrelated jobs (skip the Vite compiler, switch `.ts`/`.js` module resolution, clear the console, gate test-only routes), which made it vague and caused real bugs (e.g. `testMode` + a `dist` build resolving non-existent `.ts` files). It is replaced by purpose-specific signals:
  - **Module resolution** — now auto-detected from disk (prefers compiled `.js`, falls back to `.ts` source). No flag needed; the old source/build mismatch class of bugs is eliminated.
  - **Compiler on/off** — driven by `compiler.enabled` (`config/compiler.ts`), overridable via `CHASI_COMPILER=false`. Test envs set this to skip the build.
  - **Test-only behavior** (danger-route guard, console clear) — driven by `NODE_ENV === "test"` (set automatically by Vitest).
  - **Migration:** in `test/.env.test`, replace `testMode=enabled` with `NODE_ENV=test` and `CHASI_COMPILER=false`.
- **Dependency upgrades** — refreshed in-range dependencies plus major bumps (`express` 4→5, `mongoose` 6→9, `mongodb` 4→7, `jsonwebtoken` 8→9, `uuid` 8→14, `bcryptjs` 2→3, `serve-static` 1→2, and others); see `package.json`.
- **Fix — user model `apps` index** — the unique index on the optional `apps` array is now a partial index (`{ apps: { $type: "objectId" } }`), so users without an app reference no longer collide on `apps_1` (which previously broke 2nd+ user signup and blocked index builds).

### v4.1.3
- **Windows support** — fixed `ERR_UNSUPPORTED_ESM_URL_SCHEME` on Windows; the framework's dynamic `import()` of controllers, models, service providers, routes, and config (`src/package/Base.ts`) now wraps absolute filesystem paths with `pathToFileURL(...).href` instead of passing raw `C:\…` paths to the ESM loader (a no-op on macOS/Linux)
- **Version reporting** — the framework version is now sourced directly from `package.json["chasiVersion"]` through a single cached accessor (`src/package/version.ts`); both the API `chasiVer` field and the terminal dashboard banner read from it instead of a hardcoded string or `npm_package_version`

### v4.1.2
- **HTTPS CA chain** — `serverConfig` now accepts an optional CA chain for HTTPS, allowing full certificate-chain configuration (`src/config/server.ts`, `Server.types.ts`, `App.ts`)
- **`chasiVersion` field** — added a dedicated `chasiVersion` field to `package.json`, distinct from the npm `version`
- **Inter-worker communication** — improved message framing in `PipeHandler` and reworked `StreamBucket` for reliable inter-worker messaging; refined `NetServer`/`Channel` socket handling
- Added new entries to `template.env`

### v4.1.1
- **Error handling** — hardened error handling across modules; added database-existence checks (`Database.ts`, `Models.ts`) and proper cleanup of event listeners during server startup (`App.ts`, `Storage.ts`)
- **Port handling** — refined server port selection/handling
- **Tooling** — enhanced `.gitignore` and updated `tsconfig.json` to include the `train` directory

### v4.1.0

- **Port selection** — `serverConfig.port` now accepts a `number`, `number[]`, or `{ start, end }` range object; the `ServerPort` env var also accepts `"3010-3020"` range notation and `"3010,3011,3012"` list notation; when the chosen port is in use the runtime automatically retries each candidate in order until one succeeds, then updates `process.env.ServerPort` and `global.__basepath` to the resolved port
- **Terminal dashboard** — boot display rebuilt with a branded header (framework name + version), a runtime status bar showing Node.js version, PID, environment, port, and uptime, per-section icons and distinct colors for each group (DATABASE, ROUTE REGISTRY, BOOT, SERVICES, EXCEPTIONS, LOGS, THREADS, PERFORMANCE, WORKERS), and a route count badge on the ROUTE REGISTRY header
- **Console redraw** — replaced `console.clear()` (which wipes the terminal scrollback buffer) with `\x1b[2J\x1b[H` (erase visible screen, cursor home); scroll history is now preserved across every live update; redraws are debounced to collapse rapid burst writes into a single repaint; the dashboard re-renders correctly on terminal resize
- **Cluster + compiler compatibility** — `serviceCluster` and `compiler` can now be enabled simultaneously; workers skip the Vite engine setup via a `cluster.isWorker` guard so only the primary process initialises the compiler
- **Cluster dashboard correctness** — only the lead worker forwards structured log sections (DATABASE, BOOT, SERVICES, ROUTE REGISTRY) to the primary; all workers forward unhandled exceptions; this eliminates N×M duplicate entries in the dashboard when running with multiple workers
- **Terminal width in workers** — workers have no TTY; the primary now injects `TERM_COLS` into `process.env` before forking so all log formatters produce correctly-padded output instead of falling back to a hardcoded 100-column width
- **Lead worker role on restart** — when a worker crashes and is re-forked, `process.env.lead` is set to the same value as the crashed worker so the replacement inherits the correct lead/non-lead role; previously all restarted workers became non-lead, silently stopping structured log forwarding
- **Graceful shutdown** — the primary now handles `SIGTERM` and `SIGINT` by calling `worker.disconnect()` on each worker and allowing up to 5 seconds for in-flight requests to complete before exiting; previously the primary exited immediately, killing workers mid-request
- **`Storage.destroy()`** — new method removes the `resize` event listener and clears the performance-tracking `setInterval`; prevents listener/timer accumulation on hot reload
- **Cluster error visibility** — unhandled errors in `consumeStream`, `handleServiceActions`, and `handleSocketActions` now write to the `exceptions` dashboard section instead of being silently swallowed
- **`StreamBucket` duplicate dispatch fixed** — `runTasks()` previously used `Promise.all` with `splice(index, 1)` per concurrent callback; stale indices caused processed tasks to remain in the stack and be dispatched again on the next data chunk, producing duplicate log entries; fixed by snapshotting and clearing the stack before processing
- **`StreamBucket` overflow data loss fixed** — `checkOverFlow()` called `appendStreamData(this.overflow)` before clearing `this.overflow`; the bucket proxy re-routed the data back into overflow (because `_readystate` was still `false`) and the subsequent `this.overflow = ""` discarded it; the clear now happens before the append
- **`StreamBucket` regex** — the pipe message delimiter regex `[^)]+?` silently truncated or dropped any log message containing a `)` character (stack traces, route patterns, function calls); changed to `[\s\S]+?` to match all content including `)` and newlines
- **`forkOpts` structure fixed** — `cluster.fork(env)` expects a flat `{ KEY: value }` object; the previous `{ env: {...}, FORCE_COLOR: 3 }` structure caused workers to receive `process.env.env = "[object Object]"` and miss the intended overrides
- **Test suite** — fixed 8 bugs in the Vitest test setup: `async describe` preventing synchronous test registration, orphaned top-level `$app` instance shadowing the parameter in `routes.test.ts`, incorrect `/forget` and `/signin` route URLs, invalid `"update"` HTTP method type in `Helper`, and `authenticate()` sending `password` instead of the expected `pass` field
- **Controller loading in test mode** — fixed dynamic `import()` of controllers when the project path contains spaces; `pathToFileURL` was URL-encoding the space as `%20`, causing Vite to fail resolving the module at test time; the raw filesystem path is now passed directly to `import()` in test mode

### v4.0.0
- Added **ApiSpec** module — generates an OpenAPI 3.x JSON spec file on every boot from registered routes and auto-collected model schemas (MongoDB, Prisma, Drizzle)
- Added `src/config/apispec.ts` — fully typed `ApiSpecConfig` with output path, schema filters (`drivers`, `models`, `keyFormat`), shared components, and global security
- Schema keys support two formats: `"plain"` (`user`) or `"prefixed"` (`test:user`) controlled by `schemas.keyFormat`; every schema includes an `x-driver` extension field
- Route-level OpenAPI spec declared inline as a `spec` option on route definitions — tags auto-derived from group prefix, auth auto-resolved from `AuthRouteExceptions`
- Added **SdkBuilder** module — generates a JavaScript ES module SDK bundle from registered routes, consumed directly by frontend or mobile apps
- Added `src/config/sdkbuilder.ts` — fully typed `SdkBuilderConfig` with host, output path, HTTP client (`fetch` / `axios`), router and route exclude filters
- Added `.sdk()` method on `Endpoint` — accepts a single `SdkMiddlewareFn` or an array; handlers run at build time (route validation) and are serialised into the generated bundle as client-side validators
- Added `sdk` property to `RouteGroupProperty` and `RouterConfigInterface` — group/router-level sdk handlers propagate to all child endpoints in order (router → group → route)
- sdk() handlers are cleared from all endpoints after compilation — they never run during server operation
- Added `SdkBuilderFormatter` type — formatter function `(code: string) => string | Promise<string>` applied to the bundle before writing; built-in `terserFormatter` (terser minify + mangle) is the default
- Added `terser` to dependencies for the built-in SDK formatter
- Added `ApiSpec` and `SDK Builder` pages to the built-in documentation UI (v4.0.0 default version)
- Updated `tsconfig.json` to exclude `**/*.sdk.js` and `**/*.spec.json` generated output files from TypeScript compilation

### v3.6.0
- Added **Drizzle ORM** database driver — supports PostgreSQL (`node-postgres`, `postgres-js`), MySQL (`mysql2`), SQLite (`better-sqlite3`), and Turso (`libsql`) alongside existing MongoDB/Prisma connections
- Added `Model.drizzle(connection)` static accessor for retrieving the live Drizzle query client outside of controllers
- Added `DrizzleOptions` and `DrizzleAdapter` types to `DatabaseConfig` — full TypeScript coverage for Drizzle connection config
- All `src/config/` files now have TypeScript types with full JSDoc on every property (`src/config/types.ts` centralizes `AuthenticationConfig`, `ContainerConfig`, `ExceptionsConfig`)
- Version-aware requirements in documentation — `intro.vue` reads node/npm/git versions from the active version JSON instead of hardcoded values
- Requirements now indexed in global search — searchable by keyword (`node`, `npm`, `git`, `requirements`, `version`)
- Drizzle ORM entries added to the database section of the built-in docs (searchable adapter, schema, globals, querying, and `Model.drizzle` glossary items)
- Documentation frontend updated to v3.6.0 as default version
- Added **Observer** documentation page (Observer vs Events, `ObserverConfig` / `events` types, config file reference)
