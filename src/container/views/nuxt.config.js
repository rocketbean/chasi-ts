export default {
  "telemetry": true,
  "srcDir": "./src/container/views/",
  "components": [
    "~/components"
  ],
  "router": {
    "base": "/app/"
  },
  "css": [
    "@/assets/bulma/css/bulma.min.css",
    "@/assets/css/main.css"
  ],
  "plugins": [
    "~/plugins/vuetify.js"
  ],
  "buildModules": [
    "@nuxt/components",
    "@nuxtjs/vuetify"
  ],
  "ssr": true,
  "mode": "universal"
}