<template>
  <div >
    <section class="section ">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span> Router as a Module </span>
        </div>
      </div>
      <div class="sub-text " >
        Router is an instance of a
        <tag v-bind="{ name: 'ServiceProvider', style: 'is-primary', reference: 'ServiceProvider' }" />
        module, that acts like a module, but is running inside
        Chasi's core process. Router was modularized to extend the flexibility
        of a routing service instead of having a fixed boundary in a
        process that requires flexibility, therefore providing its users with
        extended abstraction and fluidity, while keeping the Router instances isolated
        to each other, yet connected to a single source of dependencies.
        Yep! Users can have multiple router instance, in the registry. Implementing
        different configurations, implying different sets of middlewares, authentication, controllers,
        databases, etc., but still possible to intersect if a dependency is pointed to a
        single source. Routers can also implement different types of modules like, the
        <tag v-bind="{ name: 'CompilerEngine', style: 'is-link', reference: 'CompilerEngine' }" /> which is a different
        <tag v-bind="{ name: 'ServiceProvider', style: 'is-primary', reference: 'ServiceProvider' } " /> module, and is
        mounted in the default Router Instance Chasi provides, that is possibly running this page.
      </div>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="RouterServiceProvider" />
            RouterServiceProvider
          </span>
        </div>
        <small>
          <span class="subtitle"> [./src/container/services/RouterServiceProvider] </span>
        </small>
      </div>
      <span class="sub-text">
        In RouterServiceProvider file, Routers are registered inside the boot method, which is a ServiceProvider method,
        that is being executed before the server(
        <tag v-bind="{ name: '@start', style: 'is-link', reference: 'ev-start' }" />)
        event, which is part of Chasi's lifecycle.
        <tag v-bind="{ name: 'ServiceProvider@boot', style: 'is-link', reference: 'ServiceProvider' }" />
        method is mainly for collecting information, before it runs in the registry.
        Router instance needs to be invoked inside the boot function
      </span>
    </section>

    <!-- @Router.config -->
    <list :items="data.list" :header="{ name: '<RouterConfigInterface>', hook: 'RouterConfigInterface' }" />
    <router-namespace />
  </div>
</template>

<script setup>
import { reactive } from "vue";
import RouterNamespace from "./namespace.vue"
const data = reactive({
  list: [
    {
      hook: "rci-name",
      title: "name",
      sub: "[router.name]",
      tag: "<string>",
      desc: `the value will be used as an index and must be unique.`
    },
    {
      hook: "rci-auth",
      title: "auth",
      sub: "[router.auth]",
      tag: "<string|boolean|null>",
      desc: `
        authentication can be configured from
        [./config/authentication]
        please specify a driver that is registered
        from the auth configuration file
        or you can set this parameter to
        false || null, if you intend not
        to use any auth for your router
        {String} {Boolean[false]} {null}
      `
    },
    {
      hook: "rci-prefix",
      title: "prefix",
      sub: "[router.prefix]",
      tag: "<string>",
      desc: `value will be appended to all the routes that will be registered under a router's instance`
    },
    {
      hook: "rci-namespace",
      title: "namespace",
      sub: "[router.namespace]",
      tag: "<string>",
      desc: ` a string path to a router container file.`
    },
    {
      hook: "rci-middleware",
      title: "middleware",
      sub: "[router.middleware]",
      tag: "<string|string[]>",
      desc: `middleware/s listed under this property will be implemented, to all the routes registered in the instance, <strong>except*</strong> if the route endpoint/group have a declaration of a middleware excemption`,
    },
    {
      hook: "rci-controllerDir",
      title: "ControllerDir",
      sub: "[router.ControllerDir]",
      tag: "<string|string[]>",
      desc: `a string path/s that will be added to router's controller path registry.`
    },
    {
      hook: "rci-AuthRouteExceptions",
      title: "AuthRouteExceptions?",
      sub: "[router.AuthRouteExceptions]",
      tag: "<RouteExceptions[]>",
      desc: `Option to excempt a route endpoint/s from AuthGuards,
      all routes that will be excempted in Auth implementations will have 
      the [request.auth] property in the <Request>`,
      codeContent: {
        mapping: `
<RouteException>: {
  /** @RouteExceptions.url
   * string path of the targeted endpoint
   */
  url: string,
  /** @RouteExceptions.m
   * RouterMethods
   * e.g. Post, Get, etc.
   */
  m: RouterMethods
}`,
        notes: `<RouteException> type`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "rci-data",
      title: "data?",
      sub: "[router.data]",
      tag: "Function<{}>",
      desc: `router hook, declared data inside this hook
      will be avilable throughout this Router[Instance]
      you can access data property via this.$data 
      inside a controller/method or by adding a 
      3rd argument in a route function`,
      codeContent: {
        mapping: `
async boot() {
  return [
    new Router(<RouterConfigInterface>{
      ...routerdata,
      data: (): {} => {
        return {
          /**
           * this data will be available
           * accross the RouterInstance,
           * -> Request / controllers that
           * will be accessed through
           * this router instance.
           */
          chasiVer: "2.3.5"
        };
      }
    }),
  ];
}`,
        comment: `eg:`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "rci-mount",
      title: "mount?",
      sub: "[router.mount]",
      tag: "<RouterMountable[]>",
      desc: `a router hook where third party modules 
      can be registered/mounted`,
      codeContent: {
        mapping: `
<RouterMountable>{
  name?: string,
  props?: any[], //this will be assigned as an arg. to RouterMountable.exec
  exec: Function<void>,
  //RouterMountable.exec will be consumed on boot.
}`,
        comment: `eg:`,
        notes: `<RouterMountable> type`,
        options: {
          lang: "ts",
          theme: 'vitesse-dark',
        }
      }
    },
    {
      hook: "rci-before",
      title: "before?",
      sub: "[router.before]",
      tag: "Function<void>",
      desc: `this function will be invoke before a request is passed
        into controller/handler function.`
    },
    {
      hook: "rci-after",
      title: "after?",
      sub: "[router.after]",
      tag: "Function<void>",
      desc: `this function will be invoked before a request is sent
        back to the client.`
    },
    {
      hook: "rci-displayLog",
      title: "displayLog?",
      sub: "[router.displayLog]",
      tag: "Number<0|1>",
      desc: `an option to print route information in the terminal.`
    },
  ]
})

</script>

<style lang="scss" scoped></style>