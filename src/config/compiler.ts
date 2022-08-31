import { resolve } from "path";

export default {
  enabled: false,
  driver: "NuxtJs",
  /* * *
   * Directory to compile view files
   */
  outDir: "container/views",
  serverFile: "chasi.json",
  engines: {
    NuxtJs: {
      /* * * [useProdEnv][./server.serviceCluster]
       * this option is recommended if clusters is enabled
       * and/or in production as this will utilize the
       * build on render rather than building upon
       * App[AfterApp] hook.
       * * * * * *
       * disable this option if your on development
       * and clusters @[./server.serviceCluster]
       * is disabled.
       */
      useProdEnv: false,
      /* * * * [config]
       * properties to be injected
       * into the [NuxtJs]server
       * [nuxt.config.js] file
       * check [NuxtJs]Doc::
       * https://nuxtjs.org/docs/configuration-glossary/configuration-alias
       *
       */
      config: {
        ssr: true,
        mode: "universal",
        telemetry: true,
        srcDir: "./src/container/views/",
        components: ["~/components"],
        router: {
          middleware: ["contextMiddleware"],
          base: "/app/",
          trailingSlash: false,
        },
        redirect: false,
        loading: false,
        buildModules: ["@nuxt/components", "@nuxtjs/vuetify"],
        css: ["@/assets/bulma/css/bulma.min.css", "@/assets/css/main.css"],
        plugins: [
          "~/plugins/errors.js",
          "~/plugins/vuetify.js",
          "~/plugins/axios.js",
          "~/plugins/three.js",
        ],
        build: {
          transpile: ["three", "three-trackballcontrols", "postprocessing"],
        },
        render: {
          ssr: true,
          resourceHints: false,
        },
      },
      /* * * *
       * properties to be injected into
       * [package.json] file
       */
      package: {
        devDependencies: {
          "@nuxtjs/vuetify": "^1.12.3",
        },
        dependencies: {
          nuxt: "^2.9.0",
          vuetify: "^2.6.9",
          "vuetify-loader": "^1.9.2",
        },
      },
      logRoutes: true,
    },
  },
};
