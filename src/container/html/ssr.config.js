import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
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
                href: "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
              },
              injectTo: ctx.server ? "body-prepend" : "head",
            },
          ];
        },
      },
    },
  ],
  optimizeDeps: {},
  server: {
    middlewareMode: true,
  },
  resolve: {
    alias: {
      css: "./assets/*.css",
    },
    extensions: [".vue", ".js"],
  },
  appType: "custom",
}));
