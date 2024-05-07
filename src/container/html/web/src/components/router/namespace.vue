<template>
  <section class="section">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <span>
          <hook id="RouterNamespace" />
          {{ ns.label }}
        </span>
      </div>
      <small>
        <span class="subtitle">{{ ns.sublabel }}</span>
      </small>
    </div>
    <span class="sub-text">
      {{ ns.text }}
    </span>
    <code-container mapping="router/routerNamespace" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> // example of a router namespace file</p>
      </template>
    </code-container>
  </section>

  <section class="section">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <span>
          <hook id="RouteEndpoint" />
          {{ endpoint.label }}
        </span>
      </div>
      <small>
        <span class="subtitle">{{ endpoint.sublabel }}</span>
      </small>
    </div>
    <span class="sub-text">
      Routing endpoint points to a callback function, which can be a Controller Method or a callback function. Endpoints
      is a part of a Router Namespace or can be a part of a route group. Endpoints also specifies the
      <tag v-bind="{ name: 'HTTPMethod', style: 'is-primary', reference: 'HTTPMethod' }" />, and can have similar
      address but must have a different method.
    </span>
  </section>

  <section class="section">
    <div class="pan-title">
      <div class="x-center is-size-3">
        <span>
          <hook id="RouteGroup" />
          {{ group.label }}
        </span>
      </div>
      <small>
        <span class="subtitle">{{ group.sublabel }}</span>
      </small>
    </div>
    <span class="sub-text">
      Route group is an endpoint wrapper which applies declared options to the wrapped endpoint, for instance a route
      prefix, controller, middleware, before and after request events. In case of middleware conflict, route endpoint
      declaration will be applied. route groups can also be nested, and will follow along the hierarchy.
    </span>
    <list :items="rgpList.list" :header="{ name: '<RouteGroupProperty>', hook: 'RouteGroup' }" />
    <code-container mapping="router/routeGroup" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
      <template v-slot:comment>
        <p> RouteGroup example usage </p>
      </template>
    </code-container>
  </section>
</template>

<script setup>
import { useControlStore } from "@/stores/ControlStore"
import {reactive} from "vue"
let ctx = useControlStore();
const ns = ctx.dict["RouterNamespace"]
const endpoint = ctx.dict["RouteEndpoint"]
const group = ctx.dict["RouteGroup"]
// rgpController
const rgpList = reactive({
  list: [
    {
      hook: "rgp-middleware",
      title: "middleware",
      sub: "[RouteGroupProperty.middleware]",
      tag: "<string[]>",
      desc: `the value will be used as an index and must be unique.`
    },
    {
      hook: "rgp-prefix",
      title: "prefix",
      sub: "[RouteGroupProperty.prefix]",
      tag: "<string>",
      desc: `value will be prepended to the endpoint path.`
    },
    {
      hook: "rgp-controller",
      title: "controller",
      sub: "[RouteGroupProperty.controller]",
      tag: "<string[]>",
      desc: `controller path must be under (./config/container.ts[ControllerDir]) path declaration. can be shorthanded if '@' is present before the file declaration e.g. : 'posts@PostController' then the route endpoint can be shorthanded as route.post('index', 'index'),  this will translate to (posts/PostController@index) `,
      codeContent: {
        mapping: `router/rgpController`,
        notes: `controller shorthand syntax using @`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "rgp-before",
      title: "before",
      sub: "[RouteGroupProperty.before]",
      tag: "<Function<void>",
      desc: `before() ev will be emitted before function/controller execution `
    },
    {
      hook: "rgp-after",
      title: "after",
      sub: "[RouteGroupProperty.after]",
      tag: "<Function<void>",
      desc: `after() will be emitted before sending a response object to the client`
    }
]});

</script>