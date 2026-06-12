<template>
  <div>

    <!-- ── Overview ─────────────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="compilerEngine" />
            {{ ce.label }}
          </span>
        </div>
        <small class="sublabel-text">{{ ce.sublabel }}</small>
      </div>
      <p class="sub-text">
        <strong>CompilerEngine</strong> integrates <a href="https://vitejs.dev/" target="_blank" rel="noreferrer">Vite</a>
        SSR into Chasi. It lets you colocate a Vue, React, or any Vite-compatible
        frontend alongside your API without a separate build server. Each entry in
        <code>engines[]</code> maps a Vite project to an Express router prefix and
        manages both <code>"dev"</code> (HMR, no build step) and <code>"prod"</code>
        (full build + static serving + SSR renderer) modes transparently.
      </p>
      <p class="sub-text" style="margin-top:.8rem">
        The module lives at
        <code>src/container/modules/compilerEngine/compiler.ts</code> and is
        configured in <code>src/config/compiler.ts</code>.
        <strong>Compiler engines are automatically skipped</strong> when
        <code>process.env.testMode === "enabled"</code>, so tests never trigger
        a Vite build.
      </p>
    </section>

    <!-- ── How it works ─────────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-4">
          <span><hook id="ce-lifecycle" /> How it works with Chasi</span>
        </div>
      </div>
      <p class="sub-text">
        CompilerEngine slots into the Chasi boot lifecycle in two phases — a
        <strong>build phase</strong> (primary process only) and a
        <strong>serve phase</strong> (every process that handles HTTP requests).
      </p>

      <div class="lifecycle-steps">
        <div class="ls-step">
          <span class="ls-num">1</span>
          <div class="ls-body">
            <strong>Session.beforeSessionHook()</strong>
            <p>
              Runs only on the <em>primary</em> process (guarded by
              <code>Session.checkMainThread()</code>). It calls
              <code>config.server.hooks.beforeApp(getConfig)</code>, which
              triggers each engine's <code>hook()</code> function declared in
              <code>compiler.ts</code>.
            </p>
          </div>
        </div>
        <div class="ls-step">
          <span class="ls-num">2</span>
          <div class="ls-body">
            <strong>engine.hook() → Builder.prodSetup()</strong>
            <p>
              In <code>"prod"</code> mode the hook calls
              <code>Builder.distribute(ctx.root)</code> (copies TS source to
              <code>dist/</code>) then <code>Builder.prodSetup(getConfig, ctx)</code>,
              which runs <code>vite.build()</code> for both the SSR server bundle
              (<code>.out/server/</code>) and the client bundle
              (<code>.out/client/</code>). When all engines finish, both output
              directories are populated.
            </p>
          </div>
        </div>
        <div class="ls-step">
          <span class="ls-num">3</span>
          <div class="ls-body">
            <strong>CompilerEngine.setupEngines()</strong>
            <p>
              Called during <code>Handler</code> initialization — on every process
              (primary and workers). Creates a <code>Builder</code> instance for
              each engine, which reads the Vite config and instantiates either a
              <code>prodBundler</code> or <code>devBundler</code>. This does
              <em>not</em> run any build; it only prepares the bundler objects
              needed for the next phase.
            </p>
          </div>
        </div>
        <div class="ls-step">
          <span class="ls-num">4</span>
          <div class="ls-body">
            <strong>CompilerEngine.mount() → bundler.setup($app)</strong>
            <p>
              Called by the router that declares a <code>mount</code> entry pointing
              to this engine. Chasi looks up the matching <code>Builder</code> by
              name, calls <code>bundler.rebase(prefix)</code> to set the base URL,
              then <code>bundler.setup($app)</code>. In prod mode this registers
              <code>serveStatic(clientPath)</code> on the Express app and imports
              the compiled SSR server module (<code>ssrServerModule</code>) so it
              can render HTML on every request.
            </p>
          </div>
        </div>
        <div class="ls-step">
          <span class="ls-num">5</span>
          <div class="ls-body">
            <strong>prodBundler.connectMws() — catch-all</strong>
            <p>
              Registers an <code>$app.all("*")</code> catch-all that checks
              <code>req.originalUrl.includes(base)</code>. Matching requests are
              passed to the SSR renderer; non-matching requests call
              <code>next()</code>. This is why router ordering matters — see the
              <code>mountedTo: "/"</code> note below.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CompilerEngineConfig ──────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="compilerEngineConfig" />
            {{ ceConfig.label }}
          </span>
          <span class="tag is-info is-light is-medium">&lt;CompilerEngineConfig&gt;</span>
        </div>
        <small class="sublabel-text">{{ ceConfig.sublabel }}</small>
        <p class="sub-text">{{ ceConfig.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in configProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-info is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <!-- ── builderConfig ─────────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span>
            <hook id="builderConfig" />
            {{ bcConfig.label }}
          </span>
          <span class="tag is-warning is-light is-medium">&lt;builderConfig&gt;</span>
        </div>
        <small class="sublabel-text">{{ bcConfig.sublabel }}</small>
        <p class="sub-text">{{ bcConfig.text }}</p>
      </div>
      <div class="glossary-list">
        <div v-for="item in builderProps" :key="item.id"
             :class="['glossary-item', item.id === 'bc-mountedTo' ? 'glossary-item--warn' : '']">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-warning is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>

      <p class="sub-text mt-4">Full example — <code>src/config/compiler.ts</code>:</p>
      <div class="code-block mt-2">
        <pre><code>{{ configCode }}</code></pre>
      </div>
    </section>

    <!-- ── ssr.config.js ─────────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="ce-ssrconfig" /> ssr.config.js — function form required</span>
        </div>
      </div>
      <p class="sub-text">
        <code>Builder.getConfigs()</code> dynamically imports the config file and
        immediately calls its default export as a function:
        <code>(await import(configPath)).default()</code>. This means the default
        export <strong>must be a function</strong> that returns the Vite config
        object — not a plain object.
      </p>
      <div class="code-block mt-3">
        <pre><code>{{ ssrConfigCode }}</code></pre>
      </div>
      <div class="notice is-danger mt-3">
        <span class="material-symbols-rounded notice-icon">warning</span>
        <p>
          Using the plain object form <code>defineConfig({ ... })</code> returns an
          object at import time. Calling it as a function throws
          <code>TypeError: .default is not a function</code> at server boot.
        </p>
      </div>
    </section>

    <!-- ── Dev vs Prod Modes ─────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="ce-modes" /> Dev vs Prod Modes</span>
        </div>
      </div>
      <p class="sub-text">
        Set the <code>environment</code> variable at the top of
        <code>src/config/compiler.ts</code> and pass it into each engine entry.
        All engines in the array should use the same value.
      </p>
      <div class="glossary-list mt-3">
        <div v-for="item in modeProps" :key="item.id" class="glossary-item">
          <hook :id="item.id" />
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.type" class="tag is-success is-light item-type">{{ item.type }}</span>
          <p class="sub-text">{{ item.text }}</p>
        </div>
      </div>
      <div class="code-block mt-3">
        <pre><code>{{ modeCode }}</code></pre>
      </div>
    </section>

    <!-- ── mountedTo & root prefix warning ──────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="bc-mountedTo" /> mountedTo and the root prefix</span>
        </div>
      </div>
      <p class="sub-text">
        <code>mountedTo</code> is used in two ways: Vite receives it as
        <code>base</code> at <em>build time</em>, baking it into every asset URL
        in the compiled HTML/JS; and at <em>runtime</em> <code>prodBundler</code>
        passes it as the <code>base</code> for <code>serveStatic</code> and as the
        prefix checked inside the <code>$app.all("*")</code> catch-all.
      </p>
      <p class="sub-text" style="margin-top:.8rem">
        <strong>It must exactly match the <code>prefix</code> of the router it is
        mounted on.</strong> A mismatch causes all CSS, JS, and image assets to 404 —
        the HTML links to <code>/view/assets/…</code> but the server serves them
        at a different path.
      </p>

      <div class="notice is-warning mt-3">
        <span class="material-symbols-rounded notice-icon">info</span>
        <div>
          <strong>Using <code>mountedTo: "/"</code> (root prefix)</strong>
          <p>
            When <code>base = "/"</code>, the catch-all condition
            <code>req.originalUrl.includes("/")</code> is
            <strong>always true</strong> — every URL contains a forward slash.
            This engine will intercept <em>all</em> incoming requests that reach
            it in the middleware chain, including routes meant for other engines
            or the API.
          </p>
          <p style="margin-top:.6rem">
            <strong>Solution:</strong> declare the router whose engine has
            <code>mountedTo: "/"</code> <em>last</em> in the
            <code>RouterServiceProvider.boot()</code> return array. Routers are
            initialized in order, so all non-root engines and API routers register
            their middleware first. By the time the root engine's catch-all runs,
            prefixed requests (<code>/api/…</code>, <code>/view/…</code>, etc.)
            have already been handled.
          </p>
        </div>
      </div>
      <div class="code-block mt-3">
        <pre><code>{{ mountedToCode }}</code></pre>
      </div>
    </section>

    <!-- ── Multiple Engines ──────────────────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="ce-engines" /> Multiple Engines</span>
        </div>
      </div>
      <p class="sub-text">
        Declare as many entries as needed in <code>engines[]</code>. All engine
        hooks run in <strong>parallel</strong> via <code>Promise.all</code> during
        <code>server.hooks.beforeApp</code>. Each engine must have a unique
        <code>name</code> and a distinct non-overlapping <code>mountedTo</code>
        prefix.
      </p>
      <div class="notice is-warning mt-3">
        <span class="material-symbols-rounded notice-icon">warning</span>
        <div>
          <strong>Keep engines self-contained</strong>
          <p>
            <code>Builder.sanitize()</code> deletes the engine's <code>src/</code>
            and <code>temp/</code> directories after a successful build. Because all
            hooks run in parallel, if Engine A's <code>sanitize()</code> deletes a
            directory that Engine B's Vite config still resolves to (via an
            <code>@alias</code> or shared import), Engine B's build will fail with
            a module-not-found error mid-compile.
          </p>
          <p style="margin-top:.6rem">
            Make every Vite project self-contained — copy any shared data files
            into each engine's own <code>src/</code> directory and avoid
            cross-engine <code>@alias</code> imports.
          </p>
        </div>
      </div>
    </section>

    <!-- ── serviceCluster compatibility ─────────────────────────── -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-5">
          <span><hook id="ce-cluster" /> CompilerEngine + serviceCluster</span>
        </div>
      </div>
      <p class="sub-text">
        Both modules can be enabled simultaneously (<strong>v4.1.0+</strong>). The
        split between the build phase and the serve phase makes this work safely:
      </p>
      <div class="glossary-list mt-3">
        <div class="glossary-item glossary-item--cluster">
          <span class="item-label">Primary process</span>
          <p class="sub-text">
            Runs <code>Session.beforeSessionHook()</code> → calls each engine's
            <code>hook()</code> → runs <code>vite.build()</code>. After the builds
            finish the primary process loops managing worker lifecycle — it does
            not handle HTTP requests.
          </p>
        </div>
        <div class="glossary-item glossary-item--cluster">
          <span class="item-label">Worker processes</span>
          <p class="sub-text">
            Skip <code>beforeSessionHook</code> entirely. They call
            <code>setupEngines()</code> to create builder instances (no build step),
            then <code>mount()</code> registers the static file middleware and SSR
            renderer on each worker's Express app. Because the compiled output files
            already exist (written by the primary), workers can serve them
            immediately.
          </p>
        </div>
      </div>
      <div class="notice is-info mt-3">
        <span class="material-symbols-rounded notice-icon">info</span>
        <p>
          Always set <code>environment: "prod"</code> when
          <code>serviceCluster.enabled</code> is <code>true</code>. Vite's dev server
          (HMR, <code>vite.createServer()</code>) is not designed for multi-process
          use and will produce unpredictable behaviour or crash workers.
        </p>
      </div>
      <div class="code-block mt-3">
        <pre><code>{{ clusterCode }}</code></pre>
      </div>
    </section>

  </div>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import hook from "@/components/utils/hook.vue"

const ctx = useControlStore()
const d = (id) => ctx.dict[id] ?? { label: id, text: '', sublabel: '', type: '' }

const ce       = d("compilerEngine")
const ceConfig = d("compilerEngineConfig")
const bcConfig = d("builderConfig")

const configProps  = ["ce-enabled", "ce-engines"].map(d)
const builderProps = ["bc-name","bc-environment","bc-root","bc-ssrServerModule","bc-serverBuild","bc-clientBuild","bc-configPath","bc-mountedTo","bc-hook"].map(d)
const modeProps    = ["ce-dev","ce-prod"].map(d)

const configCode = `// src/config/compiler.ts
import { resolve, join } from "path";
import { CompilerEngineConfig, Builder } from "../container/modules/compilerEngine/compiler.js";

let environment: "dev" | "prod" = "prod";

//@ts-ignore
let dirpath = environment === "dev" ? __devDirname : ___location;

const config: CompilerEngineConfig = {
  enabled: true,
  engines: [
    {
      name: "web",                               // matches router.mount() props[0]
      environment,
      root: join(dirpath, "container/html/web"),
      ssrServerModule: "entry-server.js",        // compiled output name (.js, not .jsx)
      serverBuild: {
        outDir: "./.out/server",
        emptyOutDir: true,
        ssr: "./entry-server.js",                // source entry for the SSR bundle
      },
      clientBuild: {
        outDir: "./.out/client",
        emptyOutDir: true,
        manifest: true,
        ssrManifest: true,
      },
      configPath: resolve(join(dirpath, "container/html/web/ssr.config.js")),
      mountedTo: "/pub",                         // MUST match the router prefix
      hook: async (getConfig, ctx) => {
        //@ts-ignore
        if (environment === "prod") await Builder.distribute(ctx.root);
        await Builder.prodSetup(getConfig, ctx);
      },
    },
  ],
};

export default config;`

const ssrConfigCode = `// ✅ Correct — default export is a function
// Builder.getConfigs() calls: (await import(configPath)).default()
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const useEngine   = "web";
const engineConfig = global?.$app?.config?.compiler.engines.find(e => e.name === useEngine);
const root         = engineConfig ? engineConfig.root : "./dist/container/html/web";

export default defineConfig(() => ({
  plugins: [vue()],
  appType: "custom",
  server: { middlewareMode: true },
  resolve: {
    alias: { "@": resolve(root, "src") },
    extensions: [".vue", ".js", ".ts", ".css"],
  },
}));


// ❌ Wrong — returns an object, not a callable function
//    → TypeError: .default is not a function at server boot
export default defineConfig({
  plugins: [vue()],
});`

const modeCode = `// src/config/compiler.ts

// Switch the entire app between modes by changing this one variable.
// All engine entries should use the same value.
let environment: "dev" | "prod" = "prod";

// "dev"  → vite.createServer() — HMR, no build step, source served directly.
//           Do NOT use with serviceCluster.enabled = true.
//
// "prod" → vite.build() for both SSR server and client bundles,
//           then serves compiled output as static files.
//           Required for serviceCluster and all production deployments.`

const mountedToCode = `// src/container/services/RouterServiceProvider.ts
//
// Rule: mountedTo in compiler.ts must ALWAYS equal the router prefix here.
//
// Problem with mountedTo: "/"
//   prodBundler registers: $app.all("*", (req, res, next) => {
//     if (req.originalUrl.includes("/")) { ... render ... }  // ALWAYS true
//     else next();
//   })
//   → This catch-all intercepts every request, including /api/* and /view/*
//
// Solution: declare the "/" router LAST in boot() so all other
// routers register their middleware before the root catch-all.

async boot() {
  return [
    // 1. Non-root prefixed engines and API routers first
    new Router({
      name: "view",
      prefix: "/view",          // ← specific prefix → safe to declare early
      mount: [{ name: "engine", props: ["view"], exec: CompilerEngine.instance }],
      // ...
    }),

    new Router({
      name: "api",
      prefix: "/api",           // ← specific prefix
      namespace: "container/http/api.js",
      // ...
    }),

    // 2. Root "/" engine LAST — its catch-all runs only after /view and /api
    //    have already handled their own requests.
    new Router({
      name: "web",
      prefix: "/",              // ← root prefix — must be last
      mount: [{ name: "engine", props: ["web"], exec: CompilerEngine.instance }],
      // ...
    }),
  ];
}`

const clusterCode = `// src/config/server.ts
serviceCluster: {
  enabled: true,
  workers: Math.round(os.cpus().length / 2),
  schedulingPolicy: 2,
},

// src/config/compiler.ts — always use "prod" with serviceCluster
let environment: "dev" | "prod" = "prod";

// How it works:
//
// Primary process:
//   Session.beforeSessionHook() [primary only]
//     → hooks.beforeApp()
//       → engine.hook() for each engine (parallel)
//         → Builder.distribute(root)   // copy TS source → dist/
//         → Builder.prodSetup(...)     // vite.build() → .out/server/ + .out/client/
//   → cluster.fork() × N workers
//   → primary loops managing worker lifecycle (no HTTP)
//
// Worker processes:
//   Session.createHandler()
//     → CompilerEngine.setupEngines()  // creates bundler instances, no build
//     → Router.mount()
//       → bundler.setup($app)          // registers serveStatic + SSR renderer
//       → registers $app.all("*") catch-all
//   → Express starts handling HTTP requests using compiled .out/ files`
</script>

<style scoped>
.glossary-list         { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.glossary-item         { padding: 10px 14px; border-left: 3px solid #3273dc; background: rgba(50,115,220,.04); border-radius: 4px; }
.glossary-item--warn   { border-left-color: #ffdd57; background: rgba(255,221,87,.04); }
.glossary-item--cluster{ border-left-color: #48c78e; background: rgba(72,199,142,.04); }
.item-label            { font-weight: 600; font-size: .95rem; display: block; margin-bottom: 4px; }
.item-type             { margin-left: 8px; font-family: monospace; font-size: .75rem; }
.sublabel-text         { color: #888; font-size: .8rem; display: block; margin-bottom: 4px; }
.code-block            { background: #1e1e2e; border-radius: 8px; padding: 20px; overflow-x: auto; }
.code-block pre        { color: #cdd6f4; font-size: .82rem; margin: 0; white-space: pre; }
.mt-2                  { margin-top: .5rem; }
.mt-3                  { margin-top: 1rem; }
.mt-4                  { margin-top: 1.5rem; }

/* Lifecycle steps */
.lifecycle-steps       { display: flex; flex-direction: column; gap: 0; margin-top: 1rem; }
.ls-step               { display: flex; gap: 14px; padding: 12px 0; border-left: 2px solid rgba(50,115,220,.3); margin-left: 14px; padding-left: 20px; position: relative; }
.ls-step:last-child    { border-left-color: transparent; }
.ls-num                { position: absolute; left: -14px; top: 12px; width: 26px; height: 26px; border-radius: 50%; background: #3273dc; color: #fff; font-size: .8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ls-body               { flex: 1; }
.ls-body strong        { display: block; font-size: .95rem; margin-bottom: 4px; font-family: monospace; }
.ls-body p             { font-size: .88rem; color: #adb5bd; margin: 0; line-height: 1.55; }

/* Notice boxes */
.notice                { display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; border-radius: 6px; font-size: .88rem; line-height: 1.55; }
.notice.is-warning     { background: rgba(255,221,87,.08); border: 1px solid rgba(255,221,87,.25); }
.notice.is-danger      { background: rgba(241,70,104,.08);  border: 1px solid rgba(241,70,104,.25); }
.notice.is-info        { background: rgba(50,115,220,.08);  border: 1px solid rgba(50,115,220,.25); }
.notice-icon           { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
.notice.is-warning .notice-icon { color: #ffdd57; }
.notice.is-danger  .notice-icon { color: #f14668; }
.notice.is-info    .notice-icon { color: #3273dc; }
.notice p              { margin: 0; }
.notice p + p          { margin-top: .4rem; }
</style>
