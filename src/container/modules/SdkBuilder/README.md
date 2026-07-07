# SdkBuilder

Generates a ready-to-ship **client SDK** from chasi's live route registry. For every
configured *output* it walks the registered routers, turns each endpoint into a typed
request function, and writes a self-contained `.js` bundle (fetch or axios) — plus, when
enabled, a sibling `.d.ts` that gives consumers full type-safety with **zero runtime bytes
changed**.

No decorators, no annotations, no separate spec to maintain: the SDK is derived from the
same routers your server already runs.

---

## Table of contents

- [At a glance](#at-a-glance)
- [Module layout](#module-layout)
- [The pipeline](#the-pipeline)
- [When it runs — runtime vs build mode](#when-it-runs--runtime-vs-build-mode)
- [Configuration](#configuration)
  - [Outputs](#outputs)
  - [Router selectors](#router-selectors)
  - [Naming](#naming)
  - [Typed output (`.d.ts`)](#typed-output-dts)
- [Generated output](#generated-output)
- [Using the SDK (frontend)](#using-the-sdk-frontend)
- [`sdk()` build-phase handlers](#sdk-build-phase-handlers)
- [Formatters](#formatters)
- [Environment variables](#environment-variables)
- [Extending](#extending)
- [FAQ / gotchas](#faq--gotchas)

---

## At a glance

```ts
// src/config/sdkbuilder.ts
export default <SdkBuilderConfig>{
  output: [
    {
      namespace: "api",
      enabled: true,
      host: "http://localhost:3010",
      routers: ["api"],
      httpClient: "fetch",
      filename: "sdk/chasi.sdk.js",
      formatter: terserFormatter,
    },
  ],
};
```

```bash
npm run build          # emits sdk/chasi.sdk.js  (build mode; also .d.ts if typed)
npm run start          # also regenerates the .js at boot (runtime, fire-and-forget)
```

```ts
// consumer
import { users } from "./sdk/chasi.sdk.js";
await users.signin({ email, password });
```

---

## Module layout

| File | Role |
|---|---|
| `SdkBuilder.ts` | **Orchestrator.** `SdkBuilder.build(config)` loops the outputs, runs the collector + compiler for each, tracks instances, and clears `sdk()` handlers once at the end. |
| `SdkBuilder.types.ts` | All public types: `SdkBuilderConfig`, `SdkBuilderOutput`, `SdkRouterSelector`, `SdkBuilderTyped`, `SdkRouteEntry`, `SdkBuilderFormatter`, `SdkBuildContext`. |
| `collectors/Routes.ts` | **Collector.** Reads the router registry → normalised `SdkRouteEntry[]`: path, verb, auth, middlewares, namespace, function name, and (typed builds) `reqType`/`resType`. |
| `collectors/Signatures.ts` | **Build-time signature parser.** Syntactic `ts.createSourceFile` (no type-checker) that recovers request/response type FQNs from controller source. Loaded lazily — see [Typed output](#typed-output-dts). |
| `Compiler.ts` | **Code generator.** Builds the nested namespace tree, emits the `.js` bundle (helpers + request functions) and, when typed, the `.d.ts` sidecar. |
| `formatters/terser.ts` | Default `.js` formatter (terser minify). Swap for any `(code) => string`. |

External touch-points (outside this folder):

- `src/config/sdkbuilder.ts` — the config literal.
- `src/container/services/SdkBuilderServiceProvider.ts` — wires the module into the chasi lifecycle (`beforeServerBoot` + `build`).

---

## The pipeline

```
SdkBuilder.build(config)
  └── for each enabled output:
        RouteCollector.init(output)          collectors/Routes.ts
          • normalize routers → selectors
          • walk router registry → SdkRouteEntry[]
          • (typed + build mode) resolve reqType/resType   collectors/Signatures.ts
          • report untyped routes (log, or throw on strict)
        new Compiler(output, collector)      Compiler.ts
        Compiler.compile()
          • run sdk() build-phase validation
          • generateBundle() → .js           (nested tree + _request/_validate helpers)
          • write(.js)                        formatters/terser.ts
          • (typed + build mode) writeDeclarations(generateDeclarations()) → .d.ts
  └── clearSdkHandlers()                      (once, after all outputs)
```

- **Namespace tree** — every route's key path is `[routerNamespace?, ...namespace, functionName]`.
  Segments before the function name become nested objects; the function name is the leaf. The
  tree is built once and reused by both the `.js` and the `.d.ts` so they mirror each other 1:1.
- **Collision tie-break** — if two routes resolve to the same key (e.g. `getRoles` from
  `/roles` and `/roles/:type`), the one with **fewer path params** wins; the dropped variant is
  logged. This keeps `:param` literals out of SDK URLs.

---

## When it runs — runtime vs build mode

`SdkBuilderServiceProvider` exposes **two** lifecycle hooks, both calling `SdkBuilder.build`:

| Hook | Trigger | Behaviour |
|---|---|---|
| `beforeServerBoot()` | `npm run start` / `dev` (normal server boot) | **Runtime.** Emits the `.js` only. **Fire-and-forget** (never blocks boot). **Cluster-safe:** runs only in the sole process or the **lead worker** (`process.env.lead === "1"`). Skipped entirely in build mode. |
| `build()` | `npm run build` (`globalThis.__chasiBuild`) | **Build mode.** **Awaited** so the process waits for files to be written. Emits the `.js` **and** the `.d.ts` (typed). This is the only place the typed sidecar is produced. |

Why the split: the typed layer parses `.ts` source with `typescript` (a **devDependency**). Build
mode guarantees `typescript` + `src/**` are present; a production runtime may have neither. So the
signature parser is **dynamically imported only in build mode** and the `.d.ts` is gated on
`globalThis.__chasiBuild`. A normal server boot never loads `typescript`.

---

## Configuration

`SdkBuilderConfig` is a single `output` array — chasi emits one independent SDK per entry, so a
project serving several APIs can ship one dedicated SDK each.

### Outputs

```ts
type SdkBuilderOutput = {
  namespace: string;                 // unique id for this output (also labels build logs)
  enabled: boolean;                  // master switch (other outputs unaffected)
  host: string;                      // injected as HOST; every request is prefixed with it
  routers?: (string | SdkRouterSelector)[]; // which routers/endpoints to include (omit = all)
  exclude?: RouteExceptions[];       // routes to drop, e.g. [{ m: "post", url: "/api/users/forget" }]
  httpClient?: "fetch" | "axios";    // default "fetch" (no deps); "axios" needs axios in the consumer
  filename: string;                  // output path, resolved from project root (dirs auto-created)
  formatter?: SdkBuilderFormatter;   // post-process hook; omit = raw output
  typed?: SdkBuilderTyped;           // opt-in .d.ts sidecar (build mode only)
};
```

Multiple outputs:

```ts
output: [
  { namespace: "api",   enabled: true, host, routers: ["api"],   filename: "sdk/api.sdk.js",   formatter: terserFormatter },
  { namespace: "admin", enabled: true, host, routers: ["admin"], filename: "sdk/admin.sdk.js", formatter: terserFormatter },
]
```

> Duplicate namespaces are skipped with a warning; a filename reused across outputs is warned about
> (the later write wins).

### Router selectors

A `routers` entry is either a **string** (the whole router) or an **object** for finer control:

```ts
type SdkRouterSelector = {
  router: string;                    // router name (from RouterServiceProvider)
  namespace?: string;                // wrap this selection under an extra top-level key
  filter?: (endpoint: Endpoint) => boolean; // include only endpoints returning true
  naming?: "http" | "controller";    // how functions are named (default "controller")
};
```

```ts
routers: [
  "api",                                              // whole "api" router
  { router: "admin",
    namespace: "Admin",                               // → Admin.<resource>.<fn>
    filter: (e) => e.path.includes("/reports"),       // only /reports endpoints
    naming: "controller" },
]
```

A selector `filter` that throws simply excludes that endpoint (logged) — it never breaks the build.

### Naming

Controls each generated function's name:

- **`"controller"` (default)** — the controller method (`create`, `list`, `update`, …). Multiple
  HTTP verbs on the same path stay distinct. Function-bound routes fall back to the HTTP verb.
- **`"http"`** — the HTTP verb (`get`, `post`, …). Two routes sharing resource + verb collapse
  (resolved by the [tie-break](#the-pipeline), logged).

**Namespace derivation** (`deriveResourceNamespace`): strips the router prefix, then nests the
resource under a leading version segment when present:

```
prefix "api"  /api/users/signin         → ["users"]         → users.signin
prefix "api"  /api/v2/organisations      → ["v2","organisations"] → v2.organisations.create
prefix "api"  /api/v2/orgs/roles/:type   → ["v2","orgs"]     → v2.orgs.getRoles
```

### Typed output (`.d.ts`)

Opt in per output. When `enabled` **and** the build runs in build mode, a sibling `.d.ts` is
emitted next to the `.js`.

```ts
type SdkBuilderTyped = {
  enabled: boolean;                  // default false
  declarationFile?: string;          // default = filename with .js → .d.ts
  typeModule?: string;               // barrel the types import from (default "Chasi/Http/v2")
  sourceRoot?: string;               // controller source root (default <cwd>/src)
  typesRoot?: string;                // *.d.ts type barrels (default "src/types/http/v2")
  responseStrategy?: "auto" | "annotation-only"; // default "auto"
  fallback?: { request?: string; response?: string }; // default {request:"Record<string, any>", response:"any"}
  manifest?: Record<string, { req?: string; res?: string }>; // per-route overrides, key `${verb} ${path}`
  strict?: boolean;                  // default false; true = untyped included route fails the build
  emit?: "inline" | "import";        // default "inline" (self-contained .d.ts); see below
  formatter?: SdkBuilderFormatter;   // default prettier (parser "typescript"), raw on failure
};
```

**Self-contained output (`emit`).** By default (`"inline"`) the generated `.d.ts` **copies** every
referenced type into the file as module-local `declare namespace` blocks — so the artifact has **no
external imports** and drops into any frontend as-is (nothing to resolve, nothing to clash with).
Transitive references are pulled in too, and if an inlined type references something *outside* the
barrel the build **warns** that the `.d.ts` may not be self-contained. Set `emit: "import"` only in
a **monorepo** where the consumer already resolves `typeModule` (shared types package / path-map) —
it references the barrel instead of copying it, at the cost of portability.

**How types are resolved** (`collectors/Signatures.ts`, build time only):

1. **Request** — the controller method's **first parameter type** is trusted *only* when its
   leading identifier is imported from `typeModule` (a barrel namespace). `create(req: Organisation.CreateRequest, res)` → `Organisation.CreateRequest`. Untyped/non-barrel params → fallback.
2. **Response** (`"auto"`) — swap the request's `…Request` suffix for `…Response` in the same
   namespace and **verify** that type actually exists in the `typesRoot` index. Present →
   `Organisation.CreateResponse`; absent → fallback `any`. `"annotation-only"` skips this derivation.
3. **`manifest`** always wins over the parser — key is `` `${verb} ${path}` `` (lowercase verb),
   e.g. `{ "post /api/v2/invitations": { res: "any" } }` to override a wrong copy-paste sibling.
4. **`strict: true`** turns any included route that fell back (a body route with no request type,
   or any route with no response type) into a **build failure** (non-zero exit) — a CI gate for
   full type coverage.

> **Emitted types are never invented.** A concrete type is used verbatim when found; otherwise the
> configured fallback (`Record<string, any>` for bodies, `any` for responses).

**Requirements for rich types:** the consuming app must provide a barrel module (`typeModule`,
default `Chasi/Http/v2`) declaring `<Namespace>.<Name>` request/response types, and controller
methods whose first parameter is typed from that barrel. Without them the sidecar is still emitted
but every signature uses the fallback types.

---

## Generated output

**`.js`** (nested tree, tree-shakeable named exports + a default aggregate):

```js
// Generated by chasi-ts sdkBuilder — do not edit manually.
// Host: http://localhost:3010
// Client: fetch

const HOST = "http://localhost:3010";
async function _request(method, path, payload, token) { /* fetch/axios + auth header */ }
function _validate(payload = {}, required = []) { /* throws 422 on missing required field */ }

export const v2 = {
  organisations: {
    /** POST /api/v2/organisations · protected · mw: [createOrg] */
    create: async (payload = {}, token) => { _validate(payload, ["data"]); return _request("post", "/api/v2/organisations", payload, token); },
    /** GET /api/v2/organisations · protected */
    list:   async (token) => _request("get", "/api/v2/organisations", null, token),
  },
};
export default { v2 };
```

**`.d.ts`** (mirrors the tree 1:1; `ReqBody<T>` unwraps the request `body`):

```ts
// self-contained by default (emit: "inline") — types copied in, no external imports
export declare namespace Organisation {
  export type CreateRequest = { body: { /* … */ } };
  export type CreateResponse = { /* … */ };
  export type ListResponse = { /* … */ };
}
type ReqBody<T> = T extends { body: infer B } ? B : Record<string, any>;

export declare const v2: {
  organisations: {
    /** POST /api/v2/organisations · protected · mw: [createOrg] */
    create(payload: ReqBody<Organisation.CreateRequest>, token: string): Promise<Organisation.CreateResponse>;
    /** GET /api/v2/organisations · protected */
    list(token: string): Promise<Organisation.ListResponse>;
  };
};
declare const _default: { v2: typeof v2 };
export default _default;
```

**Argument gating** (identical in `.js` and `.d.ts`):

| Route | Signature |
|---|---|
| body + protected | `fn(payload: Req, token: string): Promise<Res>` |
| body + public | `fn(payload?: Req): Promise<Res>` |
| GET/DELETE/HEAD + protected | `fn(token: string): Promise<Res>` |
| GET/DELETE/HEAD + public | `fn(): Promise<Res>` |

(`payload` is required whenever a `token` follows it — TS forbids an optional param before a
required one.)

---

## Using the SDK (frontend)

The generated bundle is a **plain ESM module** — no chasi runtime, no framework. The `fetch`
build has **zero dependencies** (works in browsers and Node 18+); the `axios` build only needs
`axios` in the consumer. The `.d.ts` (if generated) sits beside the `.js` and is picked up
automatically by TypeScript.

### 1. Get it into your app

Ship the `.js` (and `.d.ts`) to your frontend by any means — copy it in, symlink it, point your
bundler at the built path, or publish it as an internal package:

```
frontend/src/lib/api/
  chasi.sdk.js
  chasi.sdk.d.ts        # optional — enables autocomplete + types
```

Import named namespaces (tree-shakeable) or the default aggregate:

```ts
import { users } from "@/lib/api/chasi.sdk.js";
// or
import api from "@/lib/api/chasi.sdk.js";
await api.users.signin(/* … */);
```

### 2. Call an endpoint

Each function takes the request `payload` (and a `token` for protected routes) and returns the
server's parsed JSON. Errors **throw** — the SDK re-throws the server's error body, so a single
`try/catch` handles both validation and HTTP failures:

```ts
import { users } from "@/lib/api/chasi.sdk.js";

try {
  const account = await users.signin({ email: "ada@site.com", pass: "hunter2" });
  // account === the server's JSON response
} catch (err: any) {
  // err is the server's error body, e.g. { status: 401, message: "invalid credentials" }
  console.error(err.status, err.message);
}
```

**Client-side required-field guard.** Fields the route marks required are checked *before* the
request — a missing one throws immediately with **no network call**:

```ts
await users.create({ email: "x@y.com" });
// throws { status: 422, message: '[SDK] Missing required field: "name"' }
```

### 3. Protected routes & auth

Protected endpoints take the bearer **token as the last argument** (the SDK sets
`Authorization: Bearer <token>`):

```ts
// signatures:  v2.organisations.create(payload, token)   v2.organisations.list(token)
const { token } = await users.signin({ email, pass });

const org  = await v2.organisations.create({ data: { name: "Acme" } }, token);
const orgs = await v2.organisations.list(token);
```

Rather than thread the token through every call, wrap the SDK once. `Parameters<typeof fn>` keeps
the wrapper fully typed against the generated signatures:

```ts
// lib/api/index.ts
import { users, v2 } from "./chasi.sdk.js";

let token = localStorage.getItem("token") ?? "";
export const setToken = (t: string) => { token = t; localStorage.setItem("token", t); };

export const api = {
  auth: users,
  orgs: {
    create: (p: Parameters<typeof v2.organisations.create>[0]) => v2.organisations.create(p, token),
    list:   () => v2.organisations.list(token),
  },
};

// elsewhere — no token juggling
import { api, setToken } from "@/lib/api";
setToken((await api.auth.signin({ email, pass })).token);
await api.orgs.create({ data: { name: "Acme" } });
```

### 4. In a component

**React** — an async submit handler with error state:

```tsx
import { useState } from "react";
import { users } from "@/lib/api/chasi.sdk.js";

export function LoginForm() {
  const [error, setError] = useState<string>();

  async function onSubmit(email: string, pass: string) {
    try {
      const res = await users.signin({ email, pass });
      localStorage.setItem("token", res.token);
    } catch (e: any) {
      setError(e.message);           // server/validation message
    }
  }
  // … render form, show `error`
}
```

**Vue 3** (Composition API):

```vue
<script setup lang="ts">
import { ref } from "vue";
import { users } from "@/lib/api/chasi.sdk.js";

const error = ref("");
async function login(email: string, pass: string) {
  try {
    const res = await users.signin({ email, pass });
    localStorage.setItem("token", res.token);
  } catch (e: any) {
    error.value = e.message;
  }
}
</script>
```

### 5. What the types give you (when typed output is on)

With the `.d.ts` present, editors deliver a full typed experience:

- **Autocomplete** the namespace tree — `users.` → `signin` / `create`, `v2.organisations.` → ….
- **Inline docs** on hover — `/** POST /api/users/signin · public */`.
- **Typed payloads** — a wrong shape fails type-check *before* runtime:
  ```ts
  await v2.organisations.create({ data: {} }, token);  // ✓ infers Promise<Organisation.CreateResponse>
  await v2.organisations.create(123, token);           // ✗ compile error
  ```
- **Inferred returns** — `await`ing a call gives you the response type directly.

> By default the `.d.ts` is **self-contained** (`emit: "inline"`) — the referenced types are copied
> into the file, so a frontend gets full types with **nothing to install or path-map**. (In a
> monorepo you can set `emit: "import"` to reference a shared `typeModule` barrel instead.)

### 6. Environments (`HOST`)

`HOST` is **baked into the bundle at build time** (from `SDK_HOST`). For multiple environments,
build one SDK per target and ship the matching file:

```bash
SDK_HOST=https://api.staging.example.com npm run build   # → staging bundle
SDK_HOST=https://api.example.com         npm run build   # → prod bundle
```

(Or register separate [outputs](#outputs) with different `host` + `filename`.)

---

## `sdk()` build-phase handlers

Endpoints may register `.sdk()` handlers. During compilation the collector's handlers run once per
route with an `SdkBuildContext` (`{ config, route }`) so you can validate route configuration at
**build time** rather than request time. Failures are logged as warnings and never block codegen.

After **all** outputs are compiled, `SdkBuilder.clearSdkHandlers()` empties `$sdkHandlers` on every
endpoint — so `sdk()` content only ever runs during the build and in the generated bundle, never in
normal server operation.

---

## Formatters

`output.formatter: (code: string) => string | Promise<string>` post-processes the `.js` before it
is written. The default is `terserFormatter` (minify + mangle). Swap freely:

```ts
import prettier from "prettier";
formatter: (code) => prettier.format(code, { parser: "babel" });   // readable output
formatter: undefined;                                               // raw, no processing
```

The **`.d.ts`** uses its own formatter (`typed.formatter`), defaulting to prettier
`parser: "typescript"` (imported defensively; raw on failure). The `.js` formatter is never applied
to the `.d.ts` — terser cannot parse `declare`/type syntax.

---

## Environment variables

Read by `src/config/sdkbuilder.ts` (the config is plain code — adapt as you like):

| Var | Default | Effect |
|---|---|---|
| `SDKBUILDER_ENABLED` | `"true"` | `enabled` is `true` unless set to `"false"`. |
| `SDK_HOST` | `http://localhost:<ServerPort>` | `host` injected into the bundle. |
| `SDKBUILDER_OUTPUT` | `sdk/chasi.sdk.js` | output `filename`. |
| `SDKBUILDER_TYPED` | `"false"` | `typed.enabled` — emit the `.d.ts` (build mode). |
| `SDKBUILDER_STRICT` | `"false"` | `typed.strict` — fail the build on any untyped included route. |

```bash
SDKBUILDER_TYPED=true npm run build                     # .js + .d.ts
SDKBUILDER_TYPED=true SDKBUILDER_STRICT=true npm run build   # + fail if any route is untyped
```

---

## Extending

- **New HTTP client** — extend `generateRequestHelper` in `Compiler.ts` (or set `httpClient` to a
  custom string and emit your own import).
- **Custom naming / namespacing** — adjust `deriveResourceNamespace` / `functionName` in
  `collectors/Routes.ts`, or use per-selector `namespace` / `naming`.
- **Custom type sources** — the parser is syntactic and self-contained; extend
  `collectors/Signatures.ts` (e.g. read JSDoc, a different barrel convention, or OpenAPI).
- **Programmatic build** — call `SdkBuilder.build(config)` directly; inspect results via
  `SdkBuilder.getInstance(namespace)`.

---

## FAQ / gotchas

- **The `.d.ts` isn't generated on `npm run start`.** By design — the typed sidecar is build-mode
  only (`npm run build`). Runtime boots emit the `.js` only and never load `typescript`.
- **All my types are `any` / `Record<string, any>`.** No barrel (`typeModule`) or the controller
  params aren't typed from it. Provide `src/types/http/v2` barrels and barrel-typed controller
  params. The machinery is correct; it just has nothing to read.
- **My frontend can't find the imported types (`Cannot find module "Chasi/Http/v2"`), or they all
  silently became `any`.** The `.d.ts` was built with `emit: "import"`, which references a
  backend-only barrel a standalone frontend can't resolve. Use the default **`emit: "inline"`** — it
  copies the types into the `.d.ts` so the artifact is self-contained (nothing to install or
  path-map, no global `declare module` to clash). `"import"` is only for a monorepo whose frontend
  already resolves `typeModule`.
- **`emit: "inline"` logs `references external "…"`.** An inlined type reaches outside the barrel
  (e.g. a DB entity), so the copy isn't fully self-contained. Make the `typeModule` types pure
  request/response DTOs, or switch that output to `emit: "import"` and ship the barrel to consumers.
- **Build fails with "N route(s) fell back to untyped".** `typed.strict` is on and some included
  routes have no types — add them, add `manifest` overrides, or turn strict off.
- **In a cluster, who writes the SDK at runtime?** Only the lead worker (`process.env.lead === "1"`)
  or the sole process — never every worker.
- **Does the SDK ship type imports into the JS?** No. Types live only in the `.d.ts` (`import type`
  is elided); the `.js` generator is untouched by the typed layer, so the bundle is byte-identical
  whether or not typing is enabled.
