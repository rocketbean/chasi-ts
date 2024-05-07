import App from "./app.vue";
import { createRouter } from "./router.js";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import plugins from "./plugins.js";

/** Optimizing Dependencies **
 * TODO : explore vite config to force un-imported files to be included
 * ------------------------------------------------------- */
import * as maincss from "./assets/main.scss"
import * as appcss from "./assets/app.scss"
import * as animationscss from "./assets/animations.scss"
import * as bulmacss from "./assets/bulma/css/bulma.css"
/* -------------------------------------------------------
* import files that needs to be included 
* in optimized dependencies
* by default vite scan will
* not include this file/s when running build
* if not imported on related files. */


export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  const pinia = createPinia(app)
  app.use(router).use(pinia);
  plugins(app);
  return { app, router };
}
