import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { fileURLToPath } from "node:url";

export const clientBuild = {
  outDir: "./.out/client",
  emptyOutDir: true,
  manifest: true,
  ssrManifest: true,
};

export const serverBuild = {
  outDir: "./.out/server",
  emptyOutDir: true,
  ssr: "./entry-server.js",
};

export default defineConfig((command, ssrBuild) => ({
  plugins: [
    // @ts-ignore
    vuePlugin(),
    vueJsx(),
    {
      name: "external-css",
      transformIndexHtml: {
        enforce: "post",
        transform(html, ctx) {
          return [
            {
              tag: "link",
              attrs: {
                rel: "stylesheet",
                type: "text/css",
                href: "assets/bulma/css/bulma.min.css",
              },
              injectTo: ctx.server ? "body-prepend" : "head",
            },
            {
              tag: "link",
              attrs: {
                rel: "stylesheet",
                type: "text/css",
                href: "assets/main.css",
              },
              injectTo: ctx.server ? "body-prepend" : "head",
            },
          ];
        },
      },
    },
  ],
  optimizeDeps: {
    inlcude: [
      "./assets/**/*",
      "./plugins/**/*",
      "./components/**/*.vue",
      "pages/**/*",
    ],
  },
  server: {
    middlewareMode: true,
  },
  resolve: {
    alias: [],
    extensions: [".vue", ".js"],
  },
  appType: "custom",
}));
