<template >
  <div>
    <section class="section">
      <span class="sub-text">
        Chasi's server boot architecture includes a lifecycle, which makes
        <tag v-bind="{ name: 'SSR', style: 'is-link', reference: 'server-ssr' } " /> builds,
        <tag v-bind="{ name: 'Clustering', style: 'is-primary', reference: 'scserviceCluster' } " /> services, third-party
        module's process, and other implications possible to include, before or
        right after server boot. Chasi wraps an
        <tag v-bind="{ name: 'Express', style: 'is-link', reference: 'expressjs' } " />
        instance to handle boot, and
        routing internally at its core.
      </span>
    </section>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span> <hook id = "serverConfig" /> Configuration </span>
          <span class="tag is-info is-light is-medium">&lt;serverConfig&gt;</span>
        </div>
        <small>
          <span class="subtitle"> [./src/config/server.ts] </span>
        </small>
      </div>
    </section>
    <!-- @serverConfig -->
    <list :items="data.list" />

    <container/>

    <!-- Logger section -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="loggerSection" /> Logger</span>
          <span class="tag is-info is-light is-medium">global</span>
        </div>
        <small>
          <span class="subtitle">available globally — no import required</span>
        </small>
      </div>
      <div class="sub-text">
        A <code>Logger</code> instance is injected globally at startup. All methods
        accept any number of arguments and automatically pretty-print objects using
        <code>util.inspect</code>. Output respects the <code>Log_Level</code>
        environment variable — set it to <code>0</code> to silence all output.
      </div>
    </section>
    <list :items="loggerData.list" />

    <!-- Terminal Dashboard section -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="terminalDashboard" /> Terminal Dashboard</span>
          <span class="tag is-info is-light is-medium">Storage</span>
        </div>
        <small>
          <span class="subtitle">live terminal UI rendered by the primary process</span>
        </small>
      </div>
      <div class="sub-text">
        Chasi renders a live dashboard directly in the terminal. It tracks database connections,
        registered routes, booted services, worker status, exceptions, and performance — all in
        a single persistent display that redraws on new log entries and on terminal resize.
      </div>
    </section>
    <list :items="dashboardData.list" />

    <!-- Service Clustering section -->
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="clusterSection" /> Service Clustering</span>
          <span class="tag is-primary is-light is-medium">ServiceCluster</span>
        </div>
        <small>
          <span class="subtitle">[src/config/server.ts → serviceCluster]</span>
        </small>
      </div>
      <div class="sub-text">
        Enable Node.js multi-process clustering via <code>serviceCluster</code> in
        <code>src/config/server.ts</code>. The primary process manages worker lifecycle,
        pipes structured log data from the lead worker to the dashboard, and handles
        graceful shutdown on <code>SIGTERM</code> / <code>SIGINT</code>.
      </div>
    </section>
    <list :items="clusterData.list" />
  </div>
</template>
<script setup>
import {reactive} from "vue";
import container from "./Container.vue"

const loggerData = reactive({
  list: [
    {
      hook: "logLog",
      title: "Logger.log()",
      sub: "[Logger.log]",
      tag: "(...message: unknown[])",
      desc: `Plain terminal output — no prefix, no color styling. Identical to <code>console.log</code> in intent.
            Objects are formatted with <code>util.inspect</code> (depth: null).`,
      codeContent: {
        mapping: 'logger/methods',
        comment: `// Logger usage`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "logInfo",
      title: "Logger.info()",
      sub: "[Logger.info]",
      tag: "(...message: unknown[])",
      desc: `Informational output prefixed with <strong>ℹ</strong> in <span style="color:#19BEAF">cyan</span>.
            Use for routine status messages, startup confirmations, or anything useful at a glance.`
    },
    {
      hook: "logWarn",
      title: "Logger.warn()",
      sub: "[Logger.warn]",
      tag: "(...message: unknown[])",
      desc: `Warning output prefixed with <strong>⚠</strong> in <span style="color:#d4a400">yellow</span>.
            Use for non-critical issues, deprecation notices, or configuration anomalies.`
    },
    {
      hook: "logError",
      title: "Logger.error()",
      sub: "[Logger.error]",
      tag: "(...message: unknown[])",
      desc: `Error output prefixed with <strong>✖</strong> in <span style="color:#e04040">red</span>.
            Use for exceptions, failed operations, or any condition that requires immediate attention.`
    }
  ]
})

const data = reactive({
  list: [
    {
      hook: "scport",
      title: "port",
      sub: "[serverConfig.port]",
      tag: "<number | number[] | { start, end }>",
      desc: `Accepts a single port number, an explicit list, or a start/end range object.
        When the chosen port is already in use the runtime automatically tries the next
        candidate in order until one succeeds, then updates
        <code>process.env.ServerPort</code> and <code>global.__basepath</code> to the
        resolved value. The <code>ServerPort</code> env var supports the same three
        notations as a string.`
    },
    {
      hook: "scport-range",
      title: "port — range",
      sub: "[serverConfig.port]",
      tag: "{ start: number, end: number }",
      desc: `Declare a range as <code>{ start: 3010, end: 3020 }</code> in config,
        or as the string <code>"3010-3020"</code> in the <code>ServerPort</code> env var.
        The runtime tries each port in order from <code>start</code> to <code>end</code>.`
    },
    {
      hook: "scport-list",
      title: "port — list",
      sub: "[serverConfig.port]",
      tag: "number[]",
      desc: `Declare an explicit list as <code>[3010, 3011, 3012]</code> in config,
        or as the comma-separated string <code>"3010,3011,3012"</code> in the
        <code>ServerPort</code> env var. Ports are tried in declaration order.`
    },
    {
      hook: "scenvi",
      title: "environment",
      sub: "[serverConfig.environment]",
      tag: "<string>",
      desc: `Server environment to be used, this option will refer to 
        <a class = "tag is-dark">serverConfig.modes[environment]</a>
        and will launch the configuration set declared from this mode.`
    },
    {
      hook: "sccors",
      title: "cors",
      sub: "[serverConfig.cors]",
      tag: "<CorsOptions>",
      desc: `This object will be passed to <a class = "tag is-dark">NPM[Cors]</a> 
        package. <br/>
        reference: <a ref "https://www.npmjs.com/package/cors" target="_new">
        https://www.npmjs.com/package/cors</a>`
    },
    {
      hook: "sccluster",
      title: "serviceCluster",
      sub: "[serverConfig.serviceCluster]",
      tag: "<serviceCluster>",
      desc: `Enables Clustering for the api Chasi instace will be invoked 
        on the number of workers decalared at serviceCluster[workers],
        it will be equal to the available cpus by default. <br/>
        - <u>enabled</u> [boolean]:  enables the clustering <br/>
        - <u>logs</u> [boolean]: logs the cluster when enabled <br/>
        - <u>trackUsage.enabled</u> [boolean]: tracks memory heaps <br/>
        - <u>trackUsage.interval</u> [number]: track update interval <br/>
        - <u>workers</u> [number]: number or workers to assign in a cluster <br/>
        - <u>settings</u> [object]: settings to apply to the cluster. <br/>
        - <u>schedulingPolicy</u> [number]:  [1|2] <br/>
        -  [1] none - this is typically left on the OS, to distribute tasks. <br/>
        -  [2] RoundRobin - round robin approach where requests will be assigned in sequence <br/>
        check <a 
          class = "tag is-dark"
          ref "https://nodejs.org/docs/latest/api/cluster.html#clustersetupprimarysettings" 
          target="_new"> 
        NodeJS Cluster API
        </a> for reference.
        `
    },
    {
      hook: "schooks",
      title: "hooks",
      sub: "[serverConfig.hooks]",
      tag: "<beforeApp><afterApp>",
      desc: `Interact with Chasi's lifecycle<br/>
      - <a class = "tag is-dark is-small" style = "margin:2px">
        beforeApp()</a> hook will be called before booting the server <br/>
      - <a class = "tag is-dark is-small" style = "margin:2px">
        afterApp()</a> hook will be called immediately after the server boot`,
      codeContent: {
        mapping: 'server/configuration/hooks/beforeApp',
        comment: `// check this example`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "scmodes",
      title: "modes",
      sub: "[serverConfig.modes]",
      tag: "modes<serverModeConfig>",
      desc: `Set up your own server environment
      and add that inside [modes]property
      change the [environment] property to a specific
      selection, please note that the selected environment 
      must be registered in this property.`,
      codeContent: {
        mapping: 'server/configuration/modes/serverModeConfig',
        comment: `// check this example`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    }
  ]
})

const dashboardData = reactive({
  list: [
    {
      hook: "td-sections",
      title: "Dashboard sections",
      sub: "[Storage]",
      tag: "THREADS · PERFORMANCE · DATABASE · ROUTE REGISTRY · SERVICES · BOOT · EXCEPTIONS · LOGS · WORKERS",
      desc: `Each section only renders when it contains at least one entry. Sections render
        in a fixed order. The <strong>EXCEPTIONS</strong> section surfaces unhandled errors
        from all workers; all other structured sections forward only from the lead worker
        to keep the display clean.`
    },
    {
      hook: "td-redraw",
      title: "Debounced redraw",
      sub: "[Storage._redraw()]",
      tag: "~50 ms debounce",
      desc: `Rapid log writes during boot are collapsed into a single repaint ~50 ms after
        the last write. The visible screen is erased with <code>\\x1b[2J\\x1b[H</code>
        (erase + cursor home) so the scrollback buffer is never cleared — previous
        terminal output remains accessible by scrolling up.`
    },
    {
      hook: "td-resize",
      title: "Resize handling",
      sub: "[process.stdout resize]",
      tag: "TERM_COLS",
      desc: `The dashboard listens to <code>process.stdout</code> resize events and
        immediately redraws with the new terminal width. In cluster mode, worker processes
        inherit the primary's terminal width via <code>TERM_COLS</code> injected into
        <code>process.env</code> at fork time — log formatters use this so all entries
        align correctly even though workers have no TTY.`
    }
  ]
})

const clusterData = reactive({
  list: [
    {
      hook: "cls-lead",
      title: "Lead worker",
      sub: "[process.env.lead]",
      tag: "first forked worker",
      desc: `The first forked worker is designated the lead. Only the lead forwards
        structured log sections (DATABASE, BOOT, SERVICES, ROUTE REGISTRY) to the
        primary's dashboard. All workers forward unhandled exceptions. This prevents
        N×M duplicate entries when running multiple workers.`
    },
    {
      hook: "cls-termcols",
      title: "Terminal width",
      sub: "[TERM_COLS]",
      tag: "process.env.TERM_COLS",
      desc: `Worker processes have no TTY — <code>process.stdout.columns</code> is
        <code>undefined</code>. The primary injects <code>TERM_COLS</code> into
        <code>process.env</code> before forking so all workers inherit the correct
        terminal width. Log formatters (<code>Full</code>, <code>LeftFull</code>,
        <code>EndTraceFull</code>) use this value to produce correctly-padded output.`
    },
    {
      hook: "cls-restart",
      title: "Worker restart",
      sub: "[cluster.on('exit')]",
      tag: "leadWorkerId tracking",
      desc: `When a worker crashes and is re-forked, the replacement inherits the same
        lead or non-lead role as the process it replaces. The primary tracks
        <code>leadWorkerId</code> and sets <code>process.env.lead</code> correctly
        before each re-fork — previously all restarted workers became non-lead,
        silently stopping structured log forwarding.`
    },
    {
      hook: "cls-shutdown",
      title: "Graceful shutdown",
      sub: "[SIGTERM / SIGINT]",
      tag: "5s drain window",
      desc: `On <code>SIGTERM</code> or <code>SIGINT</code> the primary calls
        <code>worker.disconnect()</code> on each worker, allowing up to 5 seconds for
        in-flight requests to complete before <code>process.exit(0)</code>. Send
        <code>SIGTERM</code> to the primary PID to trigger a clean shutdown:
        <code>kill -TERM &lt;pid&gt;</code>.`
    },
    {
      hook: "cls-destroy",
      title: "Storage.destroy()",
      sub: "[SessionStorage]",
      tag: "cleanup",
      desc: `Call <code>storage.destroy()</code> to remove the terminal resize listener
        and clear the performance-tracking interval. Prevents listener and timer
        accumulation when the primary process reinitialises (e.g. hot reload).`
    },
    {
      hook: "cls-compiler",
      title: "Compiler + Cluster",
      sub: "[compiler + serviceCluster]",
      tag: "cluster.isWorker guard",
      desc: `The <code>compiler</code> module and <code>serviceCluster</code> can be
        enabled simultaneously. Workers automatically skip the Vite engine setup via a
        <code>cluster.isWorker</code> guard — only the primary process initialises the
        compiler. Set the compiler <code>environment</code> to <code>"prod"</code> for
        cluster deployments; Vite's HMR dev server is not designed for multi-process use.`
    },
    {
      hook: "cls-errors",
      title: "Cluster error surfacing",
      sub: "[consumeStream / handleSocketActions]",
      tag: "exceptions section",
      desc: `Unhandled errors inside the primary's pipe message handlers
        (<code>consumeStream</code>, <code>handleServiceActions</code>,
        <code>handleSocketActions</code>) are written to the
        <strong>EXCEPTIONS</strong> section of the terminal dashboard instead of being
        silently dropped.`
    }
  ]
})
</script>

<style scoped></style>