import { defineConfig } from "vite";
import {resolve} from "path";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
const useEngine = "web";
const engineConfig = global?.$app?.config?.compiler.engines.find(eng => eng.name === useEngine);
const root = engineConfig ? engineConfig.root : "./dist/container/html/web";

export default defineConfig((command, ssrBuild) => ({
  plugins: [
    vuePlugin(),
    vueJsx(),
    {
      name: "external-css",
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          return [
            {
              tag: "script",
              attrs: {
                src: "https://cdn.jsdelivr.net/npm/letterizejs@2.0.1/lib/letterize.min.js",
              },
              injectTo: ctx.server ? "body-prepend" : "head",
            },
          ];
        },
      },
    },
  ],
  optimizeDeps: {
    force: true,
    inlcude: [
      "./src/assets/**/*",
      "./src/plugins/**/*",
      "./src/components/***/**/*.vue",
      "./src/pages/**/*",
    ],
    exclude: ["fsevents"]
  },
  server: {
    middlewareMode: true,
  },
  resolve: {
    alias: {
      '@': resolve(root,"src")
    },
    extensions: [".vue", ".js", ".scss", ".ts", ".css"],
  },
  appType: "custom",
}));
