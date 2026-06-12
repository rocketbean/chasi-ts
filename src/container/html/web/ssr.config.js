import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const useEngine = "web";
const engineConfig = global?.$app?.config?.compiler.engines.find(eng => eng.name === useEngine);
const root = engineConfig ? engineConfig.root : "./dist/container/html/web";

export default defineConfig(() => ({
  plugins: [vue()],
  optimizeDeps: { force: true, exclude: ["fsevents"] },
  server: { middlewareMode: true },
  resolve: {
    alias: { "@": resolve(root, "src") },
    extensions: [".vue", ".js", ".ts", ".css"],
  },
  appType: "custom",
}));
