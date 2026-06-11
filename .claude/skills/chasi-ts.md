---
name: chasi-ts
description: Complete reference for the chasi-ts framework — bootstrap sequence, lifecycle, controllers, models (Mongoose + Drizzle + Prisma), routing, OpenAPI spec generation, service providers, middleware, auth, database config, testing, and project conventions.
---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Watch mode: recompile TypeScript + hot-reload server
npm run dev:html    # Watch mode with HTML/CSS/JS hot reload (nodemon)
npm run start       # Compile TypeScript and run server
npm run test        # Run Vitest test suite
npx vitest run test/app.test.ts   # run a single test file
npx tsc --noEmit    # type-check without emitting
```

TypeScript is compiled to `dist/` (CommonJS, ESNext target). The server entry point after build is `dist/server.js`.

A `postbuild` step copies HTML templates from `src/container/html/` to `dist/container/html/`.

---

## Architecture

**chasi-ts** is a TypeScript MVC framework for Node.js built on Express. It auto-loads controllers, models, routes, and services at startup, wiring them together via a lifecycle manager (`Handler`).

### Bootstrap sequence

```
src/server.ts
  → helper.ts        (globals: checkout(), Logger, Caveat, path refs)
  → Base.Ignition()  (load all config files and modules)
  → Session.initialize(handler)
      → loads service providers, models, middlewares, DB connections, auth
  → Handler boots Express app (App.ts), wires routes and listeners
```

`Handler` (`src/package/Handler.ts`) is a singleton that manages app state (`initializing → instantiating → initialized`) and provides proxy access to internals.

### Key directories

| Path | Purpose |
|------|---------|
| `src/config/` | App-level config: server, database, auth, compiler, exceptions |
| `src/container/controllers/` | Route handlers — extend base `Controller` |
| `src/container/models/` | Mongoose schemas — extend base `Model` |
| `src/container/drizzle/` | Drizzle ORM schema files |
| `src/container/services/` | Service providers (Router, Socket, Compiler, ApiSpec) |
| `src/container/middlewares/` | Custom middleware (Auth, TestMode) |
| `src/container/http/` | Route definitions (`api.ts`, `chasi.ts`) |
| `src/container/errors/` | Custom error classes |
| `src/package/framework/` | Core framework internals |
| `src/package/statics/` | Base classes: `Router`, `Controller`, `Model`, `Authorization` |
| `test/` | Vitest tests using supertest |

---

## Patterns

### Controllers

Controllers live in `src/container/controllers/` (subdirectories allowed, e.g. `v1/`). Every controller **must** extend the base `Controller`:

```ts
import Controller from "../../../package/statics/Controller.js";

export default class UserController extends Controller {
  get user() {
    return this.models.user; // access auto-loaded model by filename
  }

  async list(request, response) {
    return await this.user.find({});
  }

  async create(request, response) {
    let { email } = request.body;
    if (await this.user.findOne({ email })) {
      throw { status: 400, message: "Email already exists" };
    }
    return await this.user.create({ ...request.body });
  }

  async update(request, response) {
    let user = request.params.__user; // model-bound route param
    user = Object.assign(user, request.body);
    return await user.save();
  }

  async delete(request, response) {
    return await request.params.__user.delete();
  }
}
```

- **Return data directly** — the framework serializes the return value as the response. Do not call `res.json()`.
- **Throw errors** as plain objects `{ status: number, message: string }` or `new CustomError(message, status)`.
- Access authenticated user via `request.auth` on protected routes.
- Route-bound model instances are available as `request.params.__modelName`.
- Available via `this`: `this.models`, `this.compiler`, `this.services`, `this.$observer`.

### Models (Mongoose)

Models live in `src/container/models/` and are auto-registered at boot. They **must** extend `Model`:

```ts
import Model from "../../package/statics/Model.js";
import mongoose, { Document, Schema } from "mongoose";

export interface PropertyInterface extends Document {
  name: string;
  code: string;
}

export interface PropertyModel extends mongoose.Model<PropertyInterface> {}

const schema = new mongoose.Schema<PropertyInterface>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Property = Model.connect<PropertyInterface, PropertyModel>(
  "property",   // collection name
  schema,
  "dev"         // connection key from config/database.ts (default: "_")
);
export default Property;
```

- The first argument to `Model.connect()` becomes the key in `this.models.{name}`.
- Third argument is the connection name from `config/database.ts`; omit to use the default.
- Add statics (`schema.statics.findByX`) and instance methods (`schema.methods.doX`) directly on the schema before calling `Model.connect()`.
- Use `schema.pre("save", ...)` hooks for hashing, normalization, etc.
- Strip sensitive fields from JSON via `schema.set("toJSON", { transform })`.

### Models (Drizzle ORM)

For Drizzle connections, define schema tables in `src/container/drizzle/schema.ts`:

```ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Access Drizzle in controllers via `Model.drizzle("connectionKey")`:

```ts
import Model from "../../../package/statics/Model.js";
import { properties } from "../../drizzle/schema.js";

async list(request, response) {
  const db = Model.drizzle("pg");
  return await db.select().from(properties);
}
```

Drizzle connection config in `src/config/database.ts`:
```ts
pg: {
  driver: "drizzle",
  url: process.env.PG_URL,
  options: {
    adapter: "node-postgres",   // or: postgres-js, mysql2, better-sqlite3, libsql
    schema: "./container/drizzle/schema",
  },
},
```

### Routes

Route files live in `src/container/http/`. The function receives a `Route` instance:

```ts
import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  route.group({ prefix: "/users" }, () => {
    route.post("/signin", "v1/UserController@signin");
    route.get("/", "v1/UserController@list");
    route.post("/", "v1/UserController@create");
    route.get("/:id", "v1/UserController@index");
    route.put("/:id", "v1/UserController@update");
    route.delete("/:id", "v1/UserController@delete");
  });

  // Per-route middleware by alias (registered in config/container.ts)
  route.post("/danger", "v1/UserController@forget").middleware("testmode");
};
```

- Controller binding format: `"subdir/ControllerName@methodName"` (relative to `ControllerDir`).
- `route.group({ prefix, middleware })` applies prefix/middleware to all child routes.

#### Inline OpenAPI spec on a route

Pass a `spec` object as the third argument to any route method. Only routes with a `spec` appear in the generated `api.spec.json`:

```ts
route.post("/signup", "v1/UserController@create", {
  spec: {
    summary: "Register a new user",
    security: [],          // override global JWT — public route
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

- Tags auto-derive from the enclosing `route.group` prefix (e.g. `/users` → `"Users"`) when not explicitly set.
- `security: []` marks the route as public; omit to inherit global security.
- Effective middlewares (from `.middleware()` minus `.except()`) appear as `x-middlewares` in the generated spec.
- `$ref` schema names follow `keyFormat` from `config/apispec.ts`: `"plain"` → `user`, `"prefixed"` → `test:user`.

### Routers (RouterServiceProvider)

Named routers are declared in `src/container/services/RouterServiceProvider.ts`. Each router wraps a route file:

```ts
new Router(<RouterConfigInterface>{
  name: "api",
  auth: "dev",               // auth driver key from config/authentication.ts; false = no auth
  prefix: "/api",
  namespace: "container/http/api.js",
  ControllerDir: ["container/controllers"],
  middleware: [],
  AuthRouteExceptions: [     // routes that bypass JWT
    { m: "post", url: "/api/users/signin" },
    { m: "post", url: "/api/users/signup" },
  ],
  before: (request, response, data) => {
    response.set("Content-Type", "application/json");
  },
  data: () => ({ chasiVer: "3.0.0" }),  // injected into every response
  displayLog: 1,
})
```

- `auth: false` disables authentication for the whole router (use for SSR/static routers).
- `AuthRouteExceptions` declares public endpoints — `request.auth` is NOT populated on these.
- `beforeRoute($app)` on the provider class runs global middleware (CORS, bodyParser, static files).

### Service Providers

Service providers live in `src/container/services/` and extend `Provider`:

```ts
import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";

export default class MyServiceProvider extends Provider implements ServiceProviderInterface {
  async boot() {
    // Called during boot phase — return routers here if this is a router provider
  }

  async beforeServerBoot() {
    // Called before the HTTP server starts listening
  }

  async beforeRoute($app: any) {
    // Called before routes are registered — attach global Express middleware here
    $app.use(cors(...));
    $app.use(bodyParser.json());
  }
}
```

Register new providers in `src/config/container.ts` under `ServiceBootstrap`:

```ts
ServiceBootstrap: {
  compiler: "container/services/CompilerEngineServiceProvider",
  routers:  "container/services/RouterServiceProvider",
  sockets:  "container/services/SocketServiceProvider",
  apispec:  "container/services/ApiSpecServiceProvider",
  myservice: "container/services/MyServiceProvider",  // ← add here
}
```

### Middleware

Middleware is a plain async Express function. File path is registered by alias in `config/container.ts`:

```ts
// src/container/middlewares/MyMiddleware.ts
export default async (request, response, next) => {
  // do something
  next();
};
```

```ts
// src/config/container.ts — middlewares section
middlewares: {
  auth: "./container/middlewares/Auth",
  testmode: "./container/middlewares/TestMode.mw",
  mymiddleware: "./container/middlewares/MyMiddleware",  // ← register alias
}
```

Use by alias in routes: `route.post("/path", "Controller@method").middleware("mymiddleware")`

### Authentication

Auth drivers are configured in `src/config/authentication.ts`:

```ts
drivers: {
  dev: {
    driver: "jwt",
    handler: null,          // null = use Chasi's built-in JWT handler
    key: checkout(process.env.oauthkey, "chasi-dev"),
    model: "user",          // model name whose instance is attached to request.auth
    AuthRouteExceptions: [],
  },
}
```

- The `auth` key on a router (e.g. `"dev"`) references a driver defined here.
- On protected routes, `request.auth` contains the resolved model document.
- Generate tokens in the model: `await user.generateAuthToken("dev")` where `"dev"` matches a driver key.
- Public routes must be listed in `AuthRouteExceptions` on the router OR the driver.

### Error Handling

Throw errors from controller methods — the framework catches and formats them:

```ts
// Plain object — simplest form
throw { status: 404, message: "Not found" };

// Custom error class (src/container/errors/CustomError.ts)
import CustomError from "../../errors/CustomError.js";
throw new CustomError("email can't be found", 422);
```

`CustomError` sets `status` to 500 if omitted.

### Database Config

`src/config/database.ts` — all connections auto-connect at boot:

```ts
{
  host: checkout(process.env.database, "local"),
  bootWithDB: false,         // true = exit if DB fails at boot
  hideLogConnectionStrings: true,
  default: checkout(process.env.database, "dev"),
  connections: {
    dev:   { driver: "mongodb", url: process.env.dbConStringDev, db: process.env.devDatabaseName, ... },
    test:  { driver: "mongodb", url: process.env.dbConStringTest, db: process.env.testDatabaseName, ... },
    pg:    { driver: "drizzle", url: process.env.PG_URL, options: { adapter: "node-postgres", schema: "..." } },
    mysql: { driver: "prisma",  url: process.env.MYSQL_URL, options: { ... } },
  },
  modelsDir: ["./container/models/"],  // scanned for Mongoose model files at boot
}
```

### Environment

Copy `template.env` to `.env`. Always read env vars via `checkout()` — never access `process.env` directly in app logic:

```ts
checkout(process.env.MY_VAR, "fallback")
```

`checkout()` is a global defined in `src/package/helper.ts` and available everywhere without import.

### ApiSpec (OpenAPI generation)

`ApiSpecServiceProvider` runs at `beforeServerBoot()` and writes `api.spec.json` to the project root on every boot when `enabled: true`.

**Config** — `src/config/apispec.ts`:

```ts
{
  enabled: true,                          // master switch (APISPEC_ENABLED env var)
  output:  { filename: "api.spec.json", pretty: true },
  definition: { openapi: "3.0.0", info: { title: "...", version: "1.0.0" }, servers: [...] },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } },
  security: [{ bearerAuth: [] }],         // global security for protected routes
  schemas: {
    keyFormat: "prefixed",                // "plain" → user  |  "prefixed" → test:user
    drivers: { exclude: ["test"] },       // skip entire connections
    models:  { pg: { exclude: ["users"] } }, // skip specific models per connection
  },
}
```

**Schema collection** — `src/container/modules/ApiSpecs/collections/Schemas.ts` auto-collects from all active DB drivers:

| Driver | Key format (prefixed) | Example |
|--------|----------------------|---------|
| MongoDB | `connectionName:mongooseModelName` | `test:user` |
| Prisma | `connectionName:PrismaModelName` | `mysql:User` |
| Drizzle | `connectionName:tableExportName` | `pg:properties` |

Every schema always includes an `x-driver` field with the source connection name.

**Route collection** — only endpoints with a `spec` option in `src/container/http/` are included. Auth is auto-resolved per `AuthRouteExceptions`; middlewares appear as `x-middlewares`.

**Module layout**:
```
src/container/modules/ApiSpecs/
  ApiSpec.types.ts          ← all TypeScript types (ApiSpecConfig, ApiSpecSchemaFilter, …)
  spec.ts                   ← singleton orchestrator (ApiSpec.init(config) + compile())
  Compiler.ts               ← assembles document + writes JSON file
  collections/
    Schemas.ts              ← collects model schemas from all DB drivers
    Routers.ts              ← collects route specs, resolves auth/middleware/tags
```

---

## Testing

Tests live in `test/` using Vitest + supertest. Setup: `test/setup.ts`. Mocks: `test/mocks/`. Timeout: 20s per test.

```bash
npm run test
npx vitest run test/app.test.ts
```

---

## Adding Things — Quick Reference

| What | Where | Registration |
|------|-------|-------------|
| Controller | `src/container/controllers/[subdir]/` | Auto-loaded from `ControllerDir` |
| Mongoose model | `src/container/models/` | Auto-loaded from `database.modelsDir` |
| Drizzle table | `src/container/drizzle/schema.ts` | Referenced in connection `options.schema` |
| Route file | `src/container/http/` | Declared in `RouterServiceProvider` via `namespace` |
| Service provider | `src/container/services/` | `config/container.ts` → `ServiceBootstrap` |
| Middleware | `src/container/middlewares/` | `config/container.ts` → `middlewares` |
| Auth driver | `src/config/authentication.ts` → `drivers` | Reference by key in router `auth` field |
| DB connection | `src/config/database.ts` → `connections` | Reference by key in `Model.connect()` / `Model.drizzle()` |
| ApiSpec config | `src/config/apispec.ts` | Auto-loaded — controls spec generation, schema filters, key format |
