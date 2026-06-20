# chasi-ts deep-test — Master Plan

**Target version:** `chasi-ts@4.1.2` (locked). Tests assert behavior as it exists in
this version; discoveries that contradict expected behavior are recorded as
`it.fails`/`it.todo` with a note, not silently accommodated.

> Note: `package.json` currently still reads `4.0.1` (the version field was not bumped
> when the 4.1.x framing changes to `PipeHandler`/`StreamBucket` were merged). The lock
> here tracks the merged code/intent (4.1.2), not the stale manifest field.

**Strategy:** hybrid. A **unit tier** (`deep-test/unit/**`) mocks all infrastructure and
runs anywhere; an opt-in **integration tier** (`deep-test/integration/**`, `DEEP_INTEGRATION=1`)
exercises real MongoDB / Postgres / MySQL / sockets / clustering.

**How to read this:** each phase lists its **targets** (source files), the
**functionalities & scenarios** to cover, the **tier**, the planned **test files**, and
an **exit criteria**. Phases are ordered by dependency — earlier phases unblock later
ones. Estimated sizes are rough guidance for sequencing, not commitments.

---

## Subsystem → Phase coverage matrix

| Subsystem | Source root | Phase | Primary tier |
|-----------|-------------|-------|--------------|
| Globals & helpers | `src/package/helper.ts` | 1 | unit |
| Bootstrap (Ignition/Handler/Session) | `src/package/{Base,Handler}.ts`, `Chasi/Session.ts` | 1 | unit + integ |
| Logger | `src/package/Logger/**` | 1 | unit |
| Config loaders & scenarios | `src/config/*.ts` | 2 | unit |
| Errors & exception handling | `framework/ErrorHandler/**`, `container/errors/**` | 3 | unit |
| Observer / events | `package/Observer/**`, `statics/horizon/**`, `container/events/**` | 4 | unit |
| Database & drivers | `framework/Database/**`, `statics/Model.ts` | 5 | unit + integ |
| Models | `container/models/**` | 5 | unit + integ |
| Routing engine | `framework/Router/**`, `statics/{Router,Route}.ts` | 6 | unit |
| Controllers | `framework/Router/Controller.ts`, `statics/Controller.ts`, `container/controllers/**` | 6 | unit |
| Server / App | `framework/Server/{App,Consumer}.ts`, `config/server.ts` | 7 | unit + integ |
| Authentication | `framework/Server/Authentication.ts`, `AuthDrivers/jwt.ts`, `statics/Authorization.ts`, `container/middlewares/Auth.ts`, `container/events/Authorize.ts` | 7 | unit + integ |
| Middlewares | `container/middlewares/**` | 7 | unit |
| Service providers & lifecycle | `framework/Services/**`, `container/services/**` | 8 | unit |
| Compiler engine | `modules/compilerEngine/**`, `config/compiler.ts` | 9 | unit |
| ApiSpec generation | `modules/ApiSpecs/**`, `config/apispec.ts` | 9 | unit + integ |
| SdkBuilder | `modules/SdkBuilder/**`, `config/sdkbuilder.ts` | 9 | unit |
| NetServer / sockets | `modules/SocketServer/**`, `container/net/web.ts` | 10 | unit + integ |
| ServiceCluster | `framework/Chasi/ServiceCluster.ts` | 10 | unit + integ |
| Stream/Pipe/Pipeline | `framework/Chasi/{StreamBucket,PipeHandler,Pipeline}.ts` | 10 | unit |
| Storage / Session / FileWriter | `framework/Chasi/{Storage,Session,storage,writers,checks}` | 10 | unit |
| Config permutation matrix | all of `src/config` | 11 | unit + integ |
| Full boot E2E | whole app | 12 | integ |

---

## Phase 0 — Harness & infrastructure ✅ (this pass)

**Delivered:** `deep-test/` tree, `PLAN.md`, `README.md`, `vitest.deep.config.ts`,
`.env.test`, `docker-compose.test.yml`, and `harness/{globals,setup,app,http,mocks}.ts`
+ `harness/fixtures/`.

**Exit criteria:** `npx vitest run --config ./deep-test/vitest.deep.config.ts` discovers
the suite and reports "no tests" cleanly (config + setup load without error).

---

## Phase 1 — Foundation, globals & bootstrap ✅

**Delivered:** `unit/01-foundation/{checkout,helper-globals,deep-merge-equal,base-ignition,handler-state,session-init,logger}.test.ts`
(78 unit assertions, 1 `it.todo`). Discoveries recorded per convention: the `status`
state machine documented in `Handler.ts` comments (`off→initializing→instantiating→initialized`)
is not wired in 4.1.2 (only the numeric `_state` is mutated); `__deepMerge` mutates its
target in place and replaces — not element-wise merges — array values.

**Targets:** `src/package/helper.ts`, `src/package/Base.ts`, `src/package/Handler.ts`,
`src/package/framework/Chasi/Session.ts`, `src/package/Logger/**`.

**Functionalities & scenarios:**
- **Globals** (`helper.ts`): `checkout(val, backup)` — returns value, falls back on
  `undefined`/`null`, falls back behavior on empty string/0/false; `__testMode()` toggles
  by env; `_getMethods(obj)` enumerates prototype methods; `__getRandomStr(len)` length &
  charset; `__getRandomNum(min,max)` bounds; `__deepEqual` true/false cases incl. nested
  & arrays; `__deepMerge` shallow vs nested merge, array handling, immutability of inputs;
  path refs (`___location`, `__devDirname`, `__filepath`) are absolute & exist; `Logger`
  and `Caveat` are installed.
- **Base.Ignition()** — returns the config registry object; loads every `src/config/*`;
  `getConfig(name)` proxy returns parsed sections; missing config name behavior.
- **Handler** — singleton identity; state machine transitions
  `initializing → instantiating → initialized`; proxy access to internals; `close()`
  closes `$httpServer`; double-close safety.
- **Session.initialize(base)** — wires providers/models/middlewares/DB/auth in order
  (assert ordering with spies, mock the heavy bits).
- **Logger** (`Logger/index.ts`, `Group.ts`, `types/**`, `styles/style.ts`) — `init()`
  returns usable logger; group open/close; each writer type renders without throwing;
  `Log_Level`/`Log_History` env gating.

**Tier:** unit (Session ordering uses spies/mocks; live boot is Phase 12).

**Test files:** `unit/01-foundation/{helper-globals,checkout,deep-merge-equal,base-ignition,handler-state,session-init,logger}.test.ts`.

**Exit criteria:** every global function has positive + edge-case coverage; Handler state
machine + close path covered; Logger renders all writer types without throwing.

---

## Phase 2 — Config loaders & scenarios ✅

**Delivered:** `unit/02-config/*.test.ts` (one per config, 60 assertions). Env-driven
fields tested via `vi.resetModules()` + env mutation; `.env.test` presets
(ServerPort/database/oauthkey) deleted to prove fallbacks. compilerEngine mocked to
avoid Vite; terser imported for real. Note: `database.ts`'s `Chasi/Database` import is a
type-only ambient declaration, elided by esbuild — configs import cleanly.


**Targets:** `src/config/{server,database,authentication,compiler,container,exceptions,observer,sdkbuilder,apispec,types}.ts`.

**Functionalities & scenarios (per config — drive via env permutations through `checkout`):**
- **server.ts** — `port` from `ServerPort` vs default `3010`; `environment` selects a
  `modes` entry; `modes.local` (http, null certs) vs `modes.dev` (https, cert paths);
  `cors` defaults; `serviceCluster` enabled/disabled, `workers` math, `schedulingPolicy`
  1 vs 2, `trackUsage`; `hooks.beforeApp` invokes each compiler engine's `hook()`.
- **database.ts** — `default`/`host` resolution; each connection shape (mongodb, drizzle,
  prisma); `bootWithDB` true/false; `hideLogConnectionStrings`; `modelsDir` list;
  per-driver `options` (drizzle adapters: node-postgres/postgres-js/mysql2/better-sqlite3/libsql).
- **authentication.ts** — driver map; `dev` jwt driver (`handler:null` → built-in),
  `key` via `checkout(oauthkey,…)`, `model`, `AuthRouteExceptions`.
- **apispec.ts** — `enabled` flag (+ `APISPEC_ENABLED`); `output` filename/pretty;
  `definition`; `components.securitySchemes`; `security`; `schemas.keyFormat`
  (`plain` vs `prefixed`), `schemas.drivers.exclude`, `schemas.models.{conn}.exclude`.
- **compiler.ts** — engines list; per-engine `environment` (dev vs prod), `hook` presence,
  Vite/SSR options.
- **container.ts** — `ServiceBootstrap` map (compiler/routers/sockets/apispec + extras);
  `middlewares` alias map.
- **exceptions.ts** — logger channel config (terminal/textfile/http/database), enabled
  flags, levels.
- **observer.ts** — registered listeners/events map; enable flags.
- **sdkbuilder.ts** — enabled, output, collectors/formatters selection.
- **types.ts** — exercised indirectly via `includeSource`/typecheck of the interfaces.

**Tier:** unit (each config imported under controlled `process.env`; use
`vi.resetModules()` + env mutation to test permutations).

**Test files:** `unit/02-config/<configname>.test.ts` (one per config file).

**Exit criteria:** every config field with branching logic has both branches asserted;
each `checkout(...)` default proven; invalid/missing-env paths covered.

---

## Phase 3 — Errors & exception handling ✅

**Delivered:** `unit/03-errors/*.test.ts` (31 assertions, 1 todo). Discoveries:
`Exception.setInvoker()` crashes when the message is a common substring of the stack
(e.g. `"x"`) — pinned with an explicit `toThrow` test; `loggers/Http.ts` is an empty
stub and is not a registered ExceptionLogger channel (only database/terminal/textfile);
database/textfile loggers are no-op placeholders in 4.1.2.


**Targets:** `framework/ErrorHandler/{index,Exception,ExceptionLogger}.ts`,
`exceptions/{APIException,ChasiException,SocketException}.ts`,
`loggers/{Http,Textfile,Database,Terminal}.ts`, `container/errors/CustomError.ts`.

**Functionalities & scenarios:**
- **CustomError** — `new CustomError(msg)` defaults `status=500`; `new CustomError(msg,422)`
  sets status; instanceof Error; serialization shape.
- **Plain-object throws** `{status, message}` — normalized by the handler into a response.
- **Exception** base — capture, normalize, `status`/`message`/`stack`; unknown error
  (string / non-Error) handling.
- **APIException / ChasiException / SocketException** — correct status mapping, channel
  routing, distinct formatting per type.
- **ExceptionLogger / loggers** — Terminal logger formats & writes; Textfile logger writes
  to file (mock fs / temp dir) and rotates per `Log_History`; Database logger persists
  (mock model); Http logger posts (mock transport). Each respects enabled flag + level.
- **Caveat** global wiring (from Phase 1) routes thrown exceptions to configured loggers.

**Tier:** unit (fs + transport + DB mocked).

**Test files:** `unit/03-errors/{custom-error,exception-normalize,api-exception,chasi-exception,socket-exception,logger-terminal,logger-textfile,logger-database,logger-http}.test.ts`.

**Exit criteria:** every exception class' status/format covered; every logger channel
exercised with enabled/disabled + level gating; plain-object throw path covered.

---

## Phase 4 — Observer & events ✅

**Delivered:** `unit/04-observer/*.test.ts` (26 assertions, 1 todo). Covers Listener
defaults, Event hooks, register/when/emit, the async pipeline order
(validate→onemit→fire→fireListeners→emitted) and error isolation (a throwing stage is
swallowed and skips `emitted`), horizon registry + the Exception lifecycle event, and
`Observer.setup()` end-to-end with the real Authorize event. Full BeforeApp→ReadyApp
boot ordering deferred to the integration tier.


**Targets:** `package/Observer/{index,Event,Listener}.ts`,
`statics/horizon/{config.ts,events/{BeforeApp,BootApp,InitializeApp,ReadyApp,AfterApp,Exception}.ts}`,
`container/events/Authorize.ts`, `config/observer.ts`.

**Functionalities & scenarios:**
- **Event** — create, payload carriage, identity/name.
- **Listener** — register handler, invocation order (multiple listeners), one-shot vs
  persistent, removal/unsubscribe.
- **Observer** — `emit`/`on` (sync + async via `asynchronous-emitter`); awaiting async
  listeners; error in a listener doesn't break the chain (or does — assert actual);
  unknown-event emit is a no-op.
- **Horizon lifecycle events** — `BeforeApp/BootApp/InitializeApp/ReadyApp/AfterApp` fire
  in the documented order during boot (spy-based); `Exception` event fires on thrown
  errors and carries the exception.
- **Authorize event** — payload, when it fires relative to auth, what it exposes.
- **config/observer** — declared listener registration honored; disabled listeners skipped.

**Tier:** unit.

**Test files:** `unit/04-observer/{event,listener,observer-emit,observer-async,horizon-lifecycle,authorize-event}.test.ts`.

**Exit criteria:** sync+async emit, ordering, unsubscribe, listener-error behavior, and
each lifecycle event covered.

---

## Phase 5 — Database, drivers & models ✅

**Delivered:** `unit/05-database/*.test.ts` (40 assertions, 1 todo). Driver registry +
unknown-driver error; Database.collect/connectDbs (default→`_` alias, bootWithDB
throw/tolerate) with faked connects; mongodb (mongoose mocked), drizzle (drizzle()/schema
stubbed), prisma (Base._fetchFile spied) drivers; Model.connect/drizzle/prisma statics;
user/Unit/Property models via injected connection-less mongoose (validators, toJSON
transform, generateAuthToken JWT). bcrypt pre-save hash deferred to integration.


**Targets:** `framework/Database/{Database,Models}.ts`,
`drivers/{mongodb,prisma,drizzle,drivers}.ts`, `statics/Model.ts`,
`container/models/{user,Unit,Property}.ts`.

**Functionalities & scenarios:**
- **Driver registry** (`drivers.ts`) — resolves `mongodb|prisma|drizzle` by name; unknown
  driver error.
- **Database** — connection map build from `config/database`; `default`/`host` selection;
  `bootWithDB:true` exits/throws on failure vs `false` continues; `hideLogConnectionStrings`
  masks output; multiple named connections.
- **mongodb driver** — connect with url/db/options; connection reuse; failure handling.
- **drizzle driver** — adapter selection (node-postgres/postgres-js/mysql2/…); schema load
  from `options.schema`; `Model.drizzle(key)` returns a usable db handle.
- **prisma driver** — client init from `options`; `Model` access.
- **Model statics** (`Model.connect`) — first arg becomes `this.models.{name}` key; 3rd arg
  selects connection (default `_`); schema statics/methods preserved; `pre("save")` hooks
  run; `toJSON` transform strips sensitive fields; `generateAuthToken(driver)` issues a JWT.
- **container models** — `user` (password hashing, token gen, JSON transform), `Unit`,
  `Property` schema shape & required fields.

**Tier:** unit (mongoose/drizzle/prisma mocked via `harness/mocks.ts`) **+** integration
(`integration/db/**` against docker MongoDB/Postgres/MySQL, `skipIf(!DEEP_INTEGRATION)`).

**Test files:**
`unit/05-database/{driver-registry,database-connect,driver-mongodb,driver-drizzle,driver-prisma,model-connect,model-hooks,model-user,model-unit-property}.test.ts`;
`integration/db/{mongo-crud,drizzle-pg,prisma-mysql}.test.ts`.

**Exit criteria:** driver resolution + each driver's connect path covered; `Model.connect`
key/connection/hook/transform/token behavior covered; integration CRUD passes against live
infra when enabled.

---

## Phase 6 — Routing engine & controllers ✅

**Delivered:** `unit/06-routing/*.test.ts` (44 assertions). Route verbs/dynamic, group
prefix/nesting and middleware propagation via Registry.expand(), Endpoint
middleware/except, Registry register/auth-attach/sanitize/pullDynamic, RouteCollector,
controller injection/return/$data, UserController happy + error paths, model-bound
params. Discoveries: `Endpoint.except()` discards its `filter` result (middlewares not
mutated; exclusion enforced via excludeFromMw); `Registry.sanitizeRoute("/x/")` leaves a
trailing slash (stale `length` after leading-slash strip). Note: Collector↔Registry↔Router
form an import cycle — import Registry before Collector.


**Targets:** `framework/Router/{Router,Group,RouterModule,Route,Endpoint,Registry,Collector,Controller}.ts`,
`framework/Router/Methods/{Get,Post,Put,Patch,Delete,Options,Search,methods}.ts`,
`statics/{Router,Route,Controller}.ts`, `container/http/{api,chasi}.ts`,
`container/controllers/v1/UserController.ts`.

**Functionalities & scenarios:**
- **Route definition** — `route.get/post/put/patch/delete/options/search` register with
  correct method + path; controller binding string `"subdir/Ctrl@method"` resolves to
  `ControllerDir` + method; missing controller/method error.
- **Group** — `route.group({prefix})` prefixes children; nested groups concatenate;
  `group({middleware})` applies to all children; tag derivation from prefix (`/users`→`Users`).
- **Per-route middleware** — `.middleware(alias)` attaches; `.except(...)` removes; alias
  resolution from `config/container.middlewares`; unknown alias error.
- **Endpoint/Registry/Collector** — endpoint records carry method/url/handler/middleware/
  spec; Registry dedupes/stores; Collector enumerates for ApiSpec.
- **Method classes** (`Methods/*`) — each builds the right Express verb registration.
- **Controller base** (`statics/Controller.ts` / `Router/Controller.ts`) — return value is
  serialized as response (no `res.json` needed); thrown `{status,message}` / `CustomError`
  formatted; `this.models/compiler/services/$observer` injected; `request.auth` on protected
  routes; model-bound param `request.params.__model` resolution.
- **UserController** — `list/create/index/update/delete/signin/signup/forget` logic against
  mocked `this.user` model.
- **inline spec** — 3rd-arg `spec` attaches to endpoint; `security:[]` marks public.

**Tier:** unit (Express app built in-memory with supertest where useful, but controllers
unit-tested directly with mock req/res + mock models).

**Test files:**
`unit/06-routing/{route-define,group-prefix,group-middleware,middleware-except,methods-verbs,endpoint-registry,collector,controller-serialize,controller-errors,controller-inject,model-bound-params,user-controller}.test.ts`.

**Exit criteria:** every HTTP verb registers; group/prefix/middleware/except resolution
covered; controller return-serialization + error-formatting + injection + bound-params
covered; UserController methods covered against mocks.

---

## Phase 7 — Server, App, authentication & middleware ✅

**Delivered:** `unit/07-server-auth/*` (9 files, 30 assertions). App env/protocol,
`_resolvePorts` (all forms), install(http), https credential errors; Consumer
before/after/data + return serialization + error formatting (supertest) + bindModel;
JWTDriver sign/verify + route-exception bypass; Authentication.createDrivers; Auth +
TestMode middlewares.


**Targets:** `framework/Server/{App,Consumer,Authentication}.ts`, `AuthDrivers/jwt.ts`,
`statics/Authorization.ts`, `container/middlewares/{Auth,TestMode.mw}.ts`,
`container/events/Authorize.ts`, `config/{server,authentication}.ts`.

**Functionalities & scenarios:**
- **App** (`App.ts`) — builds Express app; `$server`/`$httpServer` exposed; http vs https
  per `modes` (mock cert read); CORS applied from `config/server.cors`; preflight handling;
  body parsing; static file mounting.
- **Consumer** — request lifecycle wrapping; `before` hook runs & can set headers; injected
  `data()` merged into every response.
- **Authentication / jwt driver** — `generateAuthToken` ↔ verify round-trip with driver
  `key`; expired/invalid/missing token; `AuthRouteExceptions` bypass (router-level &
  driver-level); `request.auth` populated with resolved `model` doc on protected routes;
  `auth:false` router disables auth entirely.
- **Authorization static** — resolve user from token; failure → 401/throws.
- **Auth middleware** — passes valid, rejects invalid, skips exceptions.
- **TestMode middleware** — only active when `__testMode()`; gates the `/forget` style
  danger routes.
- **Authorize event** — emitted with auth context (cross-check Phase 4).

**Tier:** unit (jwt round-trips real; cert/fs/model mocked) **+** integration (http-e2e
auth flow in Phase 12).

**Test files:**
`unit/07-server-auth/{app-build,app-cors,app-https-mode,consumer-before-data,jwt-driver,auth-exceptions,authorization-resolve,middleware-auth,middleware-testmode}.test.ts`.

**Exit criteria:** http/https build paths, CORS, jwt sign/verify incl. failure modes,
route-exception bypass, `request.auth` population, and both middlewares covered.

---

## Phase 8 — Service providers & lifecycle ✅

**Delivered:** `unit/08-services/*` (4 files, 16 assertions). ServicesModule
load/install, Service.boot lifecycle, Provider.init/getServices/inject (stubbed
Handler), RouterServiceProvider boot routers + beforeRoute middleware (compilerEngine
mocked), ApiSpec/SdkBuilder beforeServerBoot enabled/disabled gating (modules mocked),
Repo/Stream thin boot.


**Targets:** `framework/Services/{ServicesModule,Provider,Service}.ts`,
`container/services/{RouterServiceProvider,SocketServiceProvider,CompilerEngineServiceProvider,ApiSpecServiceProvider,SdkBuilderServiceProvider,RepoServiceProvider,StreamEngineServiceProvider}.ts`,
`config/container.ts`.

**Functionalities & scenarios:**
- **ServicesModule** — loads providers from `ServiceBootstrap`; instantiation order;
  unknown provider path error.
- **Provider/Service base** — lifecycle hooks `boot()`, `beforeServerBoot()`,
  `beforeRoute($app)` exist and are invoked at the right stage (spy-based);
  router providers may return routers from `boot()`.
- **RouterServiceProvider** — builds named `Router`(s) from config; `beforeRoute` attaches
  global middleware (cors/bodyParser/static); `AuthRouteExceptions` honored.
- **SocketServiceProvider** — wires NetServer (deep-tested in Phase 10).
- **CompilerEngineServiceProvider** — triggers compiler hook (Phase 9).
- **ApiSpecServiceProvider** — runs at `beforeServerBoot`, writes `api.spec.json` when
  `enabled` (Phase 9).
- **SdkBuilderServiceProvider** — emits SDK artifact when enabled (Phase 9).
- **RepoServiceProvider / StreamEngineServiceProvider** — boot behavior; StreamEngine wires
  Stream/Pipe (Phase 10).

**Tier:** unit (each provider booted with a mocked `$app`/handler; assert hook calls &
side effects via spies).

**Test files:**
`unit/08-services/{services-module-load,provider-lifecycle,router-provider,socket-provider,compiler-provider,apispec-provider,sdkbuilder-provider,repo-provider,streamengine-provider}.test.ts`.

**Exit criteria:** module load + ordering covered; each provider's lifecycle hooks asserted
to fire with correct effects against mocks.

---

## Phase 9 — Modules: Compiler, ApiSpec, SdkBuilder ✅

**Delivered:** `unit/09-modules/*` (7 files, 28 assertions). CompilerEngine no-op under
testMode/disabled (vite libs mocked); ApiSpec SchemaCollection (collect + mapFieldType +
keyFormat plain/prefixed + driver/model include-exclude), RouterCollection (path
conversion, security, x-middlewares), Compiler.compile + write (temp file) + ApiSpec.init;
SdkBuilder RouteCollector (router filter/exclude/protected/deriveNames) + terser formatter.


**Targets:** `modules/compilerEngine/{compiler.ts,lib/**}`,
`modules/ApiSpecs/{spec,Compiler,collections/{Schemas,Routers}}.ts`,
`modules/SdkBuilder/{SdkBuilder,Compiler,collectors/**,formatters/**}.ts`,
`config/{compiler,apispec,sdkbuilder}.ts`.

**Functionalities & scenarios:**
- **Compiler engine** — `hook(getConfig, engine)` dev vs prod branch; Vite SSR build
  invocation (mock Vite); no-op when disabled; multiple engines.
- **ApiSpec** — `ApiSpec.init(config)` singleton; `compile()` assembles OpenAPI doc;
  **Schemas collector** across drivers — mongodb `conn:model`, prisma `conn:Model`,
  drizzle `conn:table`, every schema carries `x-driver`; `keyFormat` plain vs prefixed;
  `drivers.exclude` skips a connection; `models.{conn}.exclude` skips a model;
  **Routers collector** — only routes with `spec` included; auth resolved via
  `AuthRouteExceptions`; `security:[]` → public; middlewares → `x-middlewares`; tags from
  group prefix; **Compiler** writes `api.spec.json` (pretty flag) — assert against temp
  path; `enabled:false` writes nothing.
- **SdkBuilder** — collectors gather endpoints; formatters emit SDK (`api.sdk.js` shape);
  enabled flag; output path.

**Tier:** unit (Vite + fs mocked; drivers fed from fixtures) **+** integration
(`integration/config-matrix` boots app and asserts a real `api.spec.json` is produced for
selected configs).

**Test files:**
`unit/09-modules/{compiler-hook,apispec-init,apispec-schemas-collector,apispec-keyformat,apispec-exclude,apispec-routers-collector,apispec-compile-write,sdkbuilder-collect,sdkbuilder-format}.test.ts`.

**Exit criteria:** compiler dev/prod branches; ApiSpec schema+route collection across all
three drivers with keyFormat & exclude permutations; spec write/no-write; SdkBuilder
collect+format covered.

---

## Phase 10 — Realtime, clustering, streams & storage ✅

**Delivered:** `unit/10-realtime/*` (7 files, 26 assertions). **StreamBucket framing
reassembly** (single/multiple/split/partial-tail/junk — the 4.1.x regression target);
PipeHandler.format + PIPE_DELIM; Pipeline duplex; SessionStorage write/clusterData
(stdout suppressed); NetServer registry + pipe fan-out; ServiceCluster config/ClusterData.
Discoveries: `storage/index.ts` empty stub; `checks/filewrites.ts` Windows-errno only.
Live sockets/forking → integration tier.


**Targets:** `modules/SocketServer/{NetServer.ts,lib/**}`, `container/net/web.ts`,
`framework/Chasi/{ServiceCluster,PipeHandler,Pipeline,StreamBucket,Storage,Session}.ts`,
`framework/Chasi/{storage/index.ts,writers/FileWriter.ts,checks/filewrites.ts}`,
`framework/ErrorHandler/exceptions/SocketException.ts`.

**Functionalities & scenarios:**
- **NetServer** — start/stop; client connect/disconnect; message dispatch; broadcast;
  `SocketException` on malformed input; `container/net/web.ts` namespace handlers.
- **StreamBucket / PipeHandler** — message framing across worker boundaries (the 4.1.x
  framing fix is the regression target: ensure full messages reassemble, partial chunks
  buffer, multiple framed messages split correctly); backpressure; teardown.
- **Pipeline** — stage composition; data flows through stages in order; error short-circuit.
- **ServiceCluster** — `enabled:false` runs single-process; `enabled:true` forks `workers`
  count; `schedulingPolicy` applied; `trackUsage` interval logging; worker
  startup/shutdown logs; primary↔worker IPC via PipeHandler.
- **Storage / storage/index** — get/set/has/delete; namespacing; persistence semantics.
- **FileWriter / checks/filewrites** — writes file, creates dirs, `filewrites` guard
  prevents clobbering / validates path (mock fs + temp dir).
- **Session** — `initialize()` wiring (cross-check Phase 1) and any per-request session
  state.

**Tier:** unit (sockets/cluster/fs mocked; framing tested with raw buffers) **+**
integration (`integration/sockets/**` real ws round-trip; `integration/cluster/**` real
fork — both `skipIf(!DEEP_INTEGRATION)`).

**Test files:**
`unit/10-realtime/{netserver,stream-framing,pipehandler,pipeline,servicecluster,storage,filewriter,session}.test.ts`;
`integration/sockets/ws-roundtrip.test.ts`; `integration/cluster/fork-workers.test.ts`.

**Exit criteria:** socket connect/dispatch/error covered; **message framing reassembly
covered with partial/multiple-frame buffers**; cluster enabled/disabled fork behavior
covered (unit via mocks, integration via real fork); storage & filewriter covered.

---

## Phase 11 — Configuration permutation matrix ☑ (opt-in)

**Delivered:** `integration/config-matrix/{server-modes,apispec-toggle,auth-toggle}.test.ts`
— `describe.skipIf(!DEEP_INTEGRATION)` boot-and-observe suites (server protocol, spec file
produced, dev jwt driver registered). Full both-branch permutations need per-variant
process boots; the config-derived assertions are covered in the Phase 2 unit tier.


**Targets:** all of `src/config/*` exercised **in combination** through a booting app.

**Functionalities & scenarios (cross-cutting matrices):**
- **server.modes:** `local`(http) vs `dev`(https) — app builds correct server type.
- **serviceCluster:** off vs on(workers=2) — process model.
- **database.default / driver mix:** mongodb-only, drizzle-only, mixed; `bootWithDB`
  true(fail-fast) vs false(tolerant).
- **authentication:** `auth:"dev"` vs `auth:false` routers; driver `AuthRouteExceptions`.
- **apispec:** enabled vs disabled; `keyFormat` plain vs prefixed; driver/model excludes.
- **compiler:** dev vs prod engine environment.
- **sdkbuilder:** enabled vs disabled.
- **exceptions:** each logger channel on/off.

Implemented as parameterized suites (`test.each`) that load a config variant (via env
mutation + `vi.resetModules()` for unit-checkable assertions) and, for the integration
slice, boot the app and assert the observable outcome (server type, spec file presence,
auth enforcement).

**Tier:** unit for config-derived assertions; integration (`integration/config-matrix/**`)
for boot-and-observe.

**Test files:**
`integration/config-matrix/{server-modes,cluster-toggle,db-driver-mix,auth-toggle,apispec-toggle,compiler-env,sdkbuilder-toggle,exceptions-channels}.test.ts`.

**Exit criteria:** each config dimension has both branches booted/asserted; the documented
"effect" of every major config switch is verified end-to-end at least once.

---

## Phase 12 — Full-boot integration & E2E ☑ (opt-in)

**Delivered:** `integration/http-e2e/{boot,routes-users,auth-lifecycle,errors,model-bound-params}.test.ts`
plus `integration/{db/mongo-crud,sockets/ws-roundtrip,cluster/fork-workers}.test.ts` — all
`skipIf(!DEEP_INTEGRATION)`, driven via `harness/app.ts` boot()/shutdown() and
`harness/http.ts` HttpClient. Scoped to the demo api's real routes (signin/signup);
model-bound e2e + cluster fork are `it.todo` pending a demo route / subprocess harness.


**Targets:** the whole application booted via `harness/app.ts`.

**Functionalities & scenarios:**
- **Boot** — app reaches `initialized`; no unhandled rejections; `api.spec.json` produced.
- **HTTP E2E** (supertest via `harness/http.ts`) — extends the existing `test/tests/routes`
  coverage: unknown route 404; signup 200 + duplicate rejection; signin 422 missing creds /
  200 + token / 401 wrong password; protected route requires token; `request.auth`-driven
  endpoints; model-bound param routes (`/:id` → `__user`); error responses formatted.
- **Auth lifecycle** — full sign-up → sign-in → authorized request → logout/forget.
- **Sockets** — real ws connect + echo/broadcast (overlaps Phase 10 integration).
- **Shutdown** — `handler.close()` releases port & connections; re-boot possible.

**Tier:** integration only (`DEEP_INTEGRATION=1`, live MongoDB minimum).

**Test files:**
`integration/http-e2e/{boot,routes-users,auth-lifecycle,errors,model-bound-params}.test.ts`.

**Exit criteria:** clean boot+shutdown; full user auth journey green; error-format and
bound-param routes verified against the live app.

---

## Execution order & dependencies

```
P0 (done) → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11 → P12
            └─ foundation unblocks everything
                       config/errors/observer are leaf-ish (parallelizable)
                                      P5..P8 build the request stack
                                                   P9/P10 are module-heavy
                                                              P11/P12 are integration
```

Recommended cadence: implement one phase per pass, run
`npx vitest run --config ./deep-test/vitest.deep.config.ts` green before moving on, and
keep the integration tier opt-in until Phase 11–12.

## Conventions (recap)
- Unit test imports: class-under-test + `../../harness/globals.ts`; mocks from
  `harness/mocks.ts`.
- Integration suites: `describe.skipIf(!process.env.DEEP_INTEGRATION)`.
- One subsystem per file; name `<subject>.test.ts`.
- Bugs found → `it.fails`/`it.todo` + note; do not bend the test to hide them.
- All assertions are pinned to **4.1.2** behavior.
