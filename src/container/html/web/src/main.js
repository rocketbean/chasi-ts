import { createSSRApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { createRouter } from "./router.js"
import loadPlugins from "./plugins.js"
import "@/assets/bulma/css/bulma.css"

export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  const pinia = createPinia()
  app.use(router).use(pinia)
  loadPlugins(app)
  return { app, router }
}
