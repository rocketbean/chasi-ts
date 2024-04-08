import App from "./app.vue";
import { createRouter } from "./router.js";
import { createSSRApp } from "vue";
import plugins from "./plugins.js";
export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  app.use(router);
  plugins(app);
  return { app, router };
}
