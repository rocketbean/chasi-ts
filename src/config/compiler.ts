import { resolve } from "path";

export default {
  enabled: true,
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
       * and clusters[./server.serviceCluster]
       * is disabled.
       */
      useProdEnv: false,
      /* * * * [config]
       * properties to be injected
       * into the [NuxtJs]server
       * [nuxt.config.js] file
       * check [NuxtJs]Doc::
       * https://nuxtjs.org/docs/configuration-glossary/configuration-alias
       */
      config: {
        telemetry: true,
        srcDir: "./src/container/views/",
        components: ["~/components"],
        router: {
          base: "/app/",
        },
        css: ["@/assets/bulma/css/bulma.min.css", "@/assets/css/main.css"],
        plugins: ["~/plugins/vuetify.js"],
        buildModules: ["@nuxt/components", "@nuxtjs/vuetify"],
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
