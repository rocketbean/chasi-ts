export default {
  ssr: true,
  mode: 'universal',
  telemetry: true,
  srcDir: './src/container/views/',
  components: [ '~/components' ],
  router: {
    middleware: [ 'contextMiddleware' ],
    base: '/app/',
    trailingSlash: false
  },
  redirect: false,
  loading: false,
  buildModules: [ '@nuxt/components', '@nuxtjs/vuetify' ],
  css: [ '@/assets/bulma/css/bulma.min.css', '@/assets/css/main.css' ],
  plugins: [
    '~/plugins/errors.js',
    '~/plugins/vuetify.js',
    '~/plugins/axios.js',
    '~/plugins/three.js'
  ],
  build: {
    transpile: [ 'three', 'three-trackballcontrols', 'postprocessing' ]
  },
  render: { ssr: true, resourceHints: false }
}