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
      tag: "<number>",
      desc: `This value will be passed to chasi's core upon booting, 
          and will serve as local serving port.`
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

</script>

<style scoped></style>