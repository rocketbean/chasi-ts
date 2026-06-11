# Vue + Quasar Skill for chasi-ts

This project uses **Vue 3 with SSR** (server-side rendering via chasi-ts's compiler engine). The frontend lives in `src/container/html/web/`. Vite handles bundling via `ssr.config.js`.

---

## Frontend structure

```
src/container/html/web/
  entry-client.js       # mounts app on the client
  entry-server.js       # SSR render entry
  ssr.config.js         # Vite config (loaded by chasi engine)
  src/
    main.js             # createApp() factory — add plugins here
    app.vue             # root component
    router.js           # vue-router (auto-routes from pages/*.vue)
    plugins.js          # auto-loads plugins/*.js + registers global components
    plugins/
      pinia.js          # Pinia store plugin
      axios.js          # Axios plugin
    pages/              # file-based routing (Home.vue → /, other.vue → /other)
    components/         # auto-registered globals (listed in plugins.js)
    stores/             # Pinia stores
    assets/             # SCSS + CSS (bulma currently used)
```

---

## Adding Quasar

Quasar must be installed as a Vue plugin (not via Quasar CLI) since this is a custom Vite SSR setup.

### 1. Install

```bash
npm install quasar @quasar/extras
```

### 2. Create the plugin

Create `src/container/html/web/src/plugins/quasar.js`:

```js
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'
// optional icon set:
// import '@quasar/extras/material-icons/material-icons.css'

export default (app) => {
  app.use(Quasar, {
    plugins: {}, // add Quasar plugins here (Dialog, Notify, etc.)
  })
}
```

`plugins.js` auto-imports everything in `plugins/`, so no further registration is needed.

### 3. Vite config — add Quasar plugin (ssr.config.js)

```js
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// inside plugins array:
vuePlugin({ template: { transformAssetUrls } }),
quasar({ sassVariables: 'src/assets/quasar-variables.sass' }),
```

Install the vite plugin:

```bash
npm install -D @quasar/vite-plugin sass
```

### 4. SSR caveat

Quasar's SSR mode requires server-side boot. In `entry-server.js`, ensure `Quasar` and `ssrContext` are passed:

```js
import { Quasar } from 'quasar'
// pass ssrContext to app.use(Quasar, { ..., ssrContext })
```

---

## Vue patterns in this project

### Pages (file-based routing)
Drop a `.vue` file in `src/pages/` — the router picks it up automatically.
```
pages/About.vue  →  /about
pages/Home.vue   →  /
```

### Global components
Add the component filename (without `.vue`) to the `globalComponents` array in `plugins.js`. The component file must be anywhere under `src/components/`.

### Pinia stores
Create a store in `src/stores/`, import it in the component that needs it:
```js
import { useMyStore } from '@/stores/myStore'
const store = useMyStore()
```
The `@` alias resolves to `src/`.

### Plugins
Create `src/plugins/<name>.js` exporting a default `(app) => { app.use(...) }` function. It is auto-registered — no manual import needed.

---

## Quasar component usage

Once installed, all `QBtn`, `QInput`, `QLayout`, etc. are globally available — no per-component imports needed (tree-shaking is handled by the Quasar Vite plugin).

```vue
<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-btn color="primary" label="Hello Quasar" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
```

---

## Dev workflow

```bash
npm run dev        # compile TS + hot-reload server (SSR)
npm run dev:html   # additionally watch HTML/CSS/Vue changes via nodemon
```

The Vite dev server runs in middleware mode — it is embedded in the chasi Express server, not standalone.
