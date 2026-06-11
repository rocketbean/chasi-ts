---
name: prisma
description: Prisma ORM with TypeScript in chasi-ts — schema definition, client generation, connection config, two access patterns (Model.prisma() and this.models.mysql), migrations, and typed query patterns. Use when working with Prisma models or the mysql connection in this project.
---

# Prisma ORM + TypeScript Skill (chasi-ts)

## How Prisma is wired in chasi-ts

Prisma is one of three supported ORM drivers (`mongodb`, `drizzle`, `prisma`). The framework boots the Prisma client at startup, lowercases all model names, and registers them two ways:
- `Model.prisma("mysql")` — returns the raw Prisma client
- `this.models.mysql.user` — model delegate via the framework's model collection

### File locations

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Source of truth — edit models here |
| `prisma/client/` | Generated client (`output = "./client"`) — never edit manually |
| `src/config/database.ts` → `mysql` | Prisma connection config |

### Connection config (`src/config/database.ts`)

```ts
mysql: {
  driver: "prisma",
  url: process.env.MYSQL_URL,
  options: {
    useDynamicPrismaClient: false,
    client: "./container/prisma/client",   // path to generated index.js, relative to dist/
    schema: "./src/container/prisma/schema.prisma",
    globals: {
      datasources: {
        db: { url: process.env.MYSQL_URL },
      },
    },
  },
},
```

- `client` — path to the directory containing the generated `index.js`, relative to `dist/` after compile. Update this if you move the Prisma output location.
- `globals` — spread into the `PrismaClient` constructor. Use for datasource overrides, logging config, etc.
- `url` must use `checkout()` for env access everywhere else in the app, but `config/database.ts` is the one place where `process.env` is read directly at boot.

---

## Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./client"     // relative to prisma/ → outputs to prisma/client/
}

datasource db {
  provider = "mysql"
  url      = env("MYSQL_URL")
}

model User {
  id        String    @id @default(uuid())
  name      String    @db.VarChar(255)
  password  String?   @db.VarChar(255)
  alias     String    @unique @db.VarChar(255)
  email     String    @unique @db.VarChar(255)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  apps      UserApp[]

  @@map("users")
}

model UserApp {
  id     String @id @default(uuid())
  userId String @map("user_id")
  appId  String @map("app_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, appId], map: "user_apps_user_app_unique")
  @@map("user_apps")
}
```

### Conventions in this project

- `@id @default(uuid())` — string UUIDs for all primary keys
- `@map("snake_case")` — Prisma field names are camelCase, DB columns are snake_case
- `@@map("table_name")` — model name is PascalCase, table is plural snake_case
- `@updatedAt` — auto-managed by Prisma on every `save`/`update`
- Optional fields use `?` (`String?`) — never use empty string as a null substitute
- Relations always include `onDelete: Cascade` where the parent owns the child

---

## Accessing Prisma in controllers — two patterns

The framework driver lowercases all Prisma model names at boot: `User` → `user`, `Property` → `property`. Both patterns below use lowercase keys.

### Pattern 1: `this.models.connectionName.modelName` (preferred — no extra import)

The framework populates `this.models.mysql` with all Prisma model delegates at boot. Mirror the getter pattern from `UserController`:

```ts
import Controller from "../../../package/statics/Controller.js";

export default class PropertyController extends Controller {
  get mysql() {
    return this.models.mysql;     // full Prisma client namespace via models collection
  }

  get property() {
    return this.models.mysql.property;   // shortcut to one model delegate
  }

  async list(request, response) {
    return await this.property.findMany();
  }

  async index(request, response) {
    const { id } = request.params;
    const record = await this.property.findUnique({ where: { id } });
    if (!record) throw { status: 404, message: "Not found" };
    return record;
  }

  async create(request, response) {
    const { name, code } = request.body;
    if (await this.property.findFirst({ where: { code } })) {
      throw { status: 400, message: "Code already exists" };
    }
    return await this.property.create({ data: { name, code } });
  }

  async update(request, response) {
    const { id } = request.params;
    return await this.property.update({
      where: { id },
      data: request.body,
    });
  }

  async delete(request, response) {
    const { id } = request.params;
    return await this.property.delete({ where: { id } });
  }
}
```

### Pattern 2: `Model.prisma("connectionKey")` (when you need the raw client)

```ts
import Controller from "../../../package/statics/Controller.js";
import Model from "../../../package/statics/Model.js";

export default class PropertyController extends Controller {
  get db() {
    return Model.prisma("mysql");
  }

  async list(request, response) {
    return await this.db.property.findMany();
  }
}
```

Use Pattern 2 when calling client-level methods like `db.$transaction()`, `db.$queryRaw()`.

---

## Typed queries with Prisma + TypeScript

Import generated types from the client output:

```ts
import type { Prisma } from "../../../prisma/client/index.js";

async create(request, response) {
  const data: Prisma.PropertyCreateInput = request.body;
  return await this.property.create({ data });
}

async update(request, response) {
  const { id } = request.params;
  const data: Prisma.PropertyUpdateInput = request.body;
  return await this.property.update({ where: { id }, data });
}
```

### Common input types (`Prisma` namespace)

| Operation | Type |
|-----------|------|
| Create | `Prisma.ModelCreateInput` |
| Update | `Prisma.ModelUpdateInput` |
| Where unique | `Prisma.ModelWhereUniqueInput` |
| Where filter | `Prisma.ModelWhereInput` |
| Include | `Prisma.ModelInclude` |
| Select | `Prisma.ModelSelect` |

---

## Query patterns

```ts
// Find with relation
const user = await this.models.mysql.user.findUnique({
  where: { email },
  include: { apps: true },
});

// Paginated list
const items = await this.property.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});

// Upsert
await this.models.mysql.user.upsert({
  where: { email },
  create: { name, email, alias },
  update: { name },
});

// Transaction (array form)
const db = Model.prisma("mysql");
await db.$transaction([
  db.property.create({ data: propertyData }),
  db.unit.createMany({ data: units }),
]);

// Interactive transaction (conditional logic)
await db.$transaction(async (tx) => {
  const prop = await tx.property.create({ data: propertyData });
  await tx.unit.createMany({
    data: units.map((u) => ({ ...u, propertyId: prop.id })),
  });
  return prop;
});
```

---

## Error handling in controllers

Always throw — never call `response.status()` directly:

```ts
// Plain object — preferred
throw { status: 400, message: "Code already exists" };

// CustomError (src/container/errors/CustomError.ts)
import CustomError from "../../errors/CustomError.js";
throw new CustomError("email can't be found", 422);
```

`CustomError` defaults `status` to 500 if omitted.

---

## Schema changes & migrations

```bash
# After editing prisma/schema.prisma:

# Regenerate the client (always run — TS types won't update without this)
npx prisma generate

# Create a migration file + apply it
npx prisma migrate dev --name describe_the_change

# Apply pending migrations in production
npx prisma migrate deploy

# Push schema directly to DB without a migration file (dev only)
npx prisma db push

# Open Prisma Studio (GUI browser for the DB)
npx prisma studio
```

- `db push` is for fast local iteration; use `migrate dev` for a committed migration history.
- The generated client (`prisma/client/`) is gitignored and rebuilt from the schema.

---

## Adding a new model — checklist

1. Add the model to `prisma/schema.prisma` following the conventions above
2. Run `npx prisma generate` — rebuilds the client and updates TypeScript types
3. Run `npx prisma migrate dev --name add_model_name`
4. Access via `this.models.mysql.modelname` in controllers — no additional registration needed
5. Use `Prisma.ModelCreateInput` etc. for typed inputs

---

## Environment variable

```bash
# .env
MYSQL_URL="mysql://user:password@localhost:3306/dbname"
```

Use `checkout(process.env.MYSQL_URL, "")` everywhere except `config/database.ts`, where `process.env` is read directly at boot time.
