import App from "./app.vue";
import { createRouter } from "./router.js";
import { createSSRApp } from "vue";
export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  app.use(router);
  return { app, router };
}
