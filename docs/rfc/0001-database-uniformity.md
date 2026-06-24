# RFC 0001 — Database Handling Uniformity

- **Status:** Draft
- **Target:** chasi-ts v5 (semi-breaking; stageable behind back-compat)
- **Author:** core
- **Scope:** how chasi manages connections, drivers, models, and per-ORM query access

---

## 1. Summary

chasi supports three very different data layers — **MongoDB (Mongoose ODM)**,
**Prisma**, and **Drizzle**. Today they are handled at *different altitudes*:
the connection lifecycle is roughly uniform (a driver registry), but **Mongoose
is promoted to a first-class, active-record-style integration** (`Model.connect`,
`this.models`, request-param binding) while **Prisma/Drizzle get connection
management + a native-client escape hatch** and nothing more.

This RFC proposes making the **driver/connection contract** the single uniform
seam, and *intentionally* keeping the **query/model layer native per ORM**. In
one line: **uniform plumbing, native queries.** It explicitly rejects building a
unified ORM-over-ORM query/model abstraction.

---

## 2. Motivation

The current asymmetry is not "Prisma/Drizzle are under-served polish" — it is a
contract that was shaped around Mongoose and never generalized. That produces
real leaks:

1. **Inconsistent accessors.** `Model.connect<T,K>(name, schema, conn)` is
   Mongoose-specific (registers a Mongoose model); `Model.prisma(conn)` /
   `Model.drizzle(conn)` return the *native* client. Two different mental models
   for "get at my data."
2. **`Models.collection` keying is paradigm-leaky.**
   - Mongoose → keyed by model name from `connection.models`.
   - Prisma → keyed from `driver.models`, which is derived in `PrismaDriver.setModels()`
     from `_runtimeDataModel.models` (PascalCase) but the client exposes
     **camelCase** accessors — a real mismatch surfaced during the Prisma 7 work.
   - Drizzle → keyed by table names.
   There is no single, well-defined meaning of `Models.collection[x]` across drivers.
3. **`bindModel` is Mongoose-shaped.** Request-param model binding
   (`Consumer.bindModel`) calls `Models.collection[mod].findById(id)` — `findById`
   has no uniform meaning in Prisma/Drizzle, so the feature is effectively
   Mongoose-only.
4. **Active-record vs data-mapper mismatch.** The base `Model` (extend-and-define)
   fits Mongoose's active-record style; Prisma/Drizzle are data-mapper (client +
   queries) and don't fit that mold.
5. **No uniform lifecycle beyond `connect`.** There is no uniform
   `disconnect()` / `health()` across drivers.

Net effect: developers using Prisma/Drizzle quietly bypass most of chasi's "model
layer" and use the raw client — which is *fine and correct*, but it means the
framework's model features are a Mongoose dialect wearing a generic name.

---

## 3. Current architecture (as-is)

```
config/database.ts          connections{ name → { driver, url, db, options } }, default
  └─ Database.ts            collect(): instantiate a Driver per connection
                            connectDbs(): connect all, alias default → "_"
  └─ drivers/
       drivers.ts           base Driver
       mongodb.ts           MongoDBDriver  → mongoose.createConnection().asPromise()
       prisma.ts            PrismaDriver   → new PrismaClient({ ...globals })  (+ setModels)
       drizzle.ts           DrizzleDriver  → drizzle client
       database.d.ts        DBDriverInterface, DBProperty, drivers union
  └─ Models.ts              $databases registry, collection, collectPrismaSchemas(), collect(), init()
statics/Model.ts            connect<T,K>() [mongoose] · drizzle() · prisma()  [native accessors]
Server/Consumer.ts          bindModel(params) → Models.collection[mod].findById(id)
controllers                 this.models.x   (the collection)
```

The **driver layer** is close to uniform; the **model/query layer** is Mongoose-first.

---

## 4. Goals & non-goals

**Goals**
- One **explicit, documented driver contract** every driver satisfies equally:
  config → connect → native client → disconnect/health.
- One **uniform native-client accessor** for any driver.
- Make cross-cutting framework features (e.g. param binding) **driver-agnostic via
  an opt-in capability**, degrading gracefully where a driver can't fulfill them.
- Honestly scope Mongoose's rich integration as **Mongoose convenience**, not "the
  chasi data API."

**Non-goals**
- ❌ A unified query/model API over all ORMs (a universal `find`/`save`/`where`).
- ❌ Erasing Prisma/Drizzle's schema-derived **type safety**.
- ❌ Hiding native clients. The escape hatch is a feature, not a smell.

---

## 5. Design principle: *uniform plumbing, native queries*

| Layer | Uniform? | Owner |
|---|---|---|
| Connection config / multi-connection / default resolution | ✅ uniform | chasi |
| Lifecycle: connect / disconnect / health | ✅ uniform | chasi (driver contract) |
| Native-client accessor | ✅ uniform shape | chasi exposes, driver provides |
| Cross-cutting features (param binding, etc.) | ✅ uniform via opt-in capability | chasi interface, driver fulfills |
| **Queries, models, schema, types** | ❌ **native per ORM (by design)** | the developer + their ORM |

Why not unify queries: an abstraction over Mongoose (documents/operators/hooks),
Prisma (schema-codegen, end-to-end types), and Drizzle (SQL builder, typed SQL)
collapses to a least-common-denominator that leaks on transactions, relations,
aggregations, raw SQL — and erases the type safety that is Prisma/Drizzle's whole
value. That path is a well-known graveyard.

---

## 6. Proposed design

### 6.1 Formalize the driver contract

Make `DBDriverInterface` the explicit spine; every driver implements it:

```ts
interface DBDriver<Client = unknown> {
  driverName: "mongodb" | "prisma" | "drizzle";
  name: string;                 // connection name
  isDefault: boolean;
  connect(report: (msg: string) => void): Promise<Client>;
  disconnect(): Promise<void>;  // NEW — uniform teardown
  health(): Promise<boolean>;   // NEW — uniform liveness
  client(): Client;             // NEW — the live native client (mongoose Connection / PrismaClient / drizzle db)
}
```

### 6.2 One uniform native-client accessor

Replace the per-ORM accessors with a single shape (keep old ones as deprecated
aliases):

```ts
// any driver → its native client
const db = Model.use("pg");          // PrismaClient | drizzle db | mongoose Connection
// deprecated aliases kept for back-compat:
Model.prisma("pg"); Model.drizzle("pg");
```

Mongoose's `Model.connect(name, schema, conn)` **stays**, documented explicitly as
**Mongoose sugar** (active-record model registration), not the cross-DB API.

### 6.3 Opt-in capability for cross-cutting features

Define small capability interfaces a driver *may* implement. Framework features
consume the capability and degrade gracefully when absent.

```ts
interface ModelResolvable {
  // resolve a record by id for request-param binding, etc.
  resolveModel(model: string, id: string): Promise<unknown | null>;
}
```

- `MongoDBDriver` implements it (via `findById`).
- `PrismaDriver` may implement it (via `client[model].findUnique({ where: { id } })`).
- `DrizzleDriver` may implement it (or not).
- `Consumer.bindModel` calls `driver.resolveModel?.(...)` instead of hardcoding
  `findById`, and **no-ops** when the active driver lacks the capability.

### 6.4 Fix / clarify `Models.collection`

`Models.collection` becomes an explicit, per-driver **registry** with a documented
contract, OR is demoted in favor of native access:
- Mongoose: model-name → model (unchanged).
- Prisma: fix the PascalCase→camelCase mismatch so keys match the client's actual
  accessors (or drop the map and rely on `Model.use(conn)`).
- Drizzle: table-name → table (unchanged).

Prefer **native access via `Model.use(conn)`** as the documented path; keep
`this.models` working for Mongoose as convenience.

---

## 7. Migration plan (incremental, back-compat first)

**Phase 0 — Documentation (non-breaking, ship now/soon)**
- Document the *current* reality honestly: connection contract is uniform;
  `Model.connect`/`this.models`/`bindModel` are Mongoose conveniences; Prisma 7
  needs `prisma.config.ts` + a driver adapter via `options.globals.adapter`.

**Phase 1 — Additive contract (non-breaking)**
- Add `disconnect()`, `health()`, `client()` to every driver.
- Add `Model.use(conn)` as the uniform accessor; keep `Model.prisma/drizzle` as
  deprecated aliases.

**Phase 2 — Capability-ize cross-cutting features (non-breaking)**
- Introduce `ModelResolvable`; implement for Mongoose; make `bindModel` consume it
  with graceful no-op fallback. Optionally implement for Prisma/Drizzle.

**Phase 3 — Registry cleanup (semi-breaking, v5)**
- Define `Models.collection` contract; fix Prisma keying; document native access
  as primary. Possibly gate the old behavior behind a flag for one minor.

**Phase 4 — Deprecations land (v5)**
- Remove deprecated accessor aliases; finalize docs.

Back-compat: Phases 0–2 add only; existing apps keep working. The semi-breaking
parts (3–4) are v5 and individually flaggable.

---

## 8. Alternatives considered

- **Unified ORM-over-ORM query/model API.** Rejected: least-common-denominator,
  leaks on real queries, erases type safety. (§5)
- **Fully loose — chasi only opens connections, devs do everything else.**
  Rejected: loses the genuinely valuable uniform plumbing (config, multi-connection,
  lifecycle, the accessor) and the cross-cutting features.
- **Status quo.** Rejected: the Mongoose-shaped contract leaks (§2) and confuses
  the mental model for Prisma/Drizzle users.

---

## 9. Risks

- `this.models` / `bindModel` are used by existing apps → stage behind back-compat;
  only Phases 3–4 touch them, in v5.
- Capability fallback must be obvious (a no-op param binding should not look like a
  silent bug) → log when a feature is skipped for lack of capability.
- Per-ORM `client()` typing: preserve native types (generics), don't widen to `any`.

---

## 10. Decision sought

1. Accept the principle: **uniform plumbing, native queries** (no unified query API).
2. Approve the additive Phase 1–2 work for the next minor (non-breaking).
3. Schedule Phase 3–4 (registry cleanup + deprecations) for **v5**.
