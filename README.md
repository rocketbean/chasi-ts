# chasi-ts &nbsp;`v3.6.0`

A TypeScript MVC framework for Node.js, built on Express. Chasi autoloads controllers, models, routes, and services at startup, wiring them together through a structured lifecycle — so you focus on your application logic, not the boilerplate.

- **npm** — https://www.npmjs.com/package/@rocketbean/chasi-ts
- **CLI** — https://www.npmjs.com/package/@rocketbean/chasis
- **GitHub** — https://github.com/rocketbean/chasi-ts

> **Docs** — full interactive documentation is served locally. Start the server and open `http://localhost:3010` in your browser.

---

## Requirements

| Tool | Minimum version |
|------|----------------|
| Node.js | `>=20.0.0` |
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
npm i -g @rocketbean/chasis
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
   ServerPort=3010
   environment=local

   # Database
   database=local
   databaseName=mydb
   dbConStringLocal=mongodb://localhost:27017/

   # Auth
   oauthkey=your-secret-key
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

TypeScript compiles to `dist/` (CommonJS, ESNext target). The `postbuild` step automatically copies HTML templates from `src/container/html/` to `dist/container/html/`.

---

## CLI

Install the Chasi CLI globally or use it via `npx`:

```bash
npm i -g @rocketbean/chasis
# or use npx chasis <command>
```

### Create a Controller
```bash
chasis create -c UserController
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
chasis create -m User
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
chasis create -p MyServiceProvider
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
chasis create -w AuthMiddleware
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
| `src/container/services/` | Service providers (Router, Socket, Compiler) |
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

> Set the compiler `environment` to `"prod"` before enabling clustering — Vite's dev server is not cluster-safe.

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
  { url: "/api/users/login", m: "post" },
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
testMode=enabled
environment=local
ServerPort=3010
database=test
testDatabaseName=mydb_test
dbConStringTest=mongodb://localhost:27017/
```

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

> Compiler engines are automatically skipped when `process.env.testMode === "enabled"`.

---

## View / SSR

Chasi uses [Vite](https://vitejs.dev/) for server-side rendering. The frontend project lives in `src/container/html/web/` and is configured in `src/config/compiler.ts`.

Switch between `"dev"` (Vite HMR) and `"prod"` (static build) by changing the `environment` variable at the top of `compiler.ts`.

---

## Release Notes

### v3.6.0
- Added **Drizzle ORM** database driver — supports PostgreSQL (`node-postgres`, `postgres-js`), MySQL (`mysql2`), SQLite (`better-sqlite3`), and Turso (`libsql`) alongside existing MongoDB/Prisma connections
- Added `Model.drizzle(connection)` static accessor for retrieving the live Drizzle query client outside of controllers
- Added `DrizzleOptions` and `DrizzleAdapter` types to `DatabaseConfig` — full TypeScript coverage for Drizzle connection config
- All `src/config/` files now have TypeScript types with full JSDoc on every property (`src/config/types.ts` centralizes `AuthenticationConfig`, `ContainerConfig`, `ExceptionsConfig`)
- Version-aware requirements in documentation — `intro.vue` reads node/npm/git versions from the active version JSON instead of hardcoded values
- Requirements now indexed in global search — searchable by keyword (`node`, `npm`, `git`, `requirements`, `version`)
- Drizzle ORM entries added to the database section of the built-in docs (searchable adapter, schema, globals, querying, and `Model.drizzle` glossary items)
- Documentation frontend updated to v3.6.0 as default version

### v3.5.0
- Added **Drizzle ORM** database driver — supports PostgreSQL, MySQL, SQLite, and Turso alongside existing MongoDB/Prisma connections
- Added global `Logger` with `.log()`, `.info()`, `.warn()`, `.error()` methods (available without import)
- Added version switcher to built-in documentation UI
- Improved Observer event system (`beforeEmit` / `afterEmit` global hooks)
- TypeScript config types added to all `src/config/` files with full JSDoc
- Dynamic requirements display in documentation — version-specific values per release
- Global search now indexes requirements (node, npm, git) as searchable entries
- Various documentation improvements

### v3.0.0 (from v2.4.2)
- TypeScript support added throughout the framework
- Improved database driver architecture
- Multiple simultaneous database connections
- Improved Prisma DB driver integration
- Improved Vite SSR integration
- Node.js cluster support via `serviceCluster` config
- JWT authentication driver with per-router configuration
- Fixed bugs in the routing system
- Enhanced error handling and exception logging
- Improved middleware pipeline
- Vitest integration for API testing
- Environment-aware server modes (http/https per environment)
