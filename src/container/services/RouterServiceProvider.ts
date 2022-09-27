import {
  ServiceProviderInterface,
  RouterConfigInterface,
  RouterMountable,
} from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import Router from "../../package/statics/Router.js";
import CompilerEngine from "../modules/compilerEngine/compiler.js";
export default class RouterServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot() {
    return [
      new Router({
        name: "api",
        /**
         * authentication can be configured from
         * [./config/authentication]
         * please specify a driver that is registered
         * from the auth configuration file
         * or you can set this parameter to
         * false || null, if you intend not
         * to use any auth for your router
         * {String} {Boolean[false]} {null}
         */
        auth: "dev",
        /**
         * prefix[string]
         * will be appended to all the routes
         * registered from the namespace.
         */
        prefix: "/api",
        /**
         * this file directory
         * is where endpoints will be registered
         * this file must contain a function
         * that will accept [route] as
         * parameter
         */
        namespace: "container/http/api.js",
        /**
         * directories registered
         * here will be overlooked by
         * Chasi App instance.
         */
        ControllerDir: ["container/controllers/"],
        /**
         * this list of middleware will be applied to
         * all of the routes registered at
         * this namespace
         */
        middleware: [],
        /**
         * if there's an instance where
         * you will have route/s that needs to
         * be excempted from Authentication Guards
         * you can register those endpoint here.
         * and please note that unauthorized guard
         * will not be able to access params like
         * [request.auth],
         */
        AuthRouteExceptions: [],

        /**
         * Router Hooks
         */
        data: () => {
          return {
            abc: 123,
          };
        },
        mount: <RouterMountable[]>[
          {
            name: "engine",
            props: ["web"],
            exec: CompilerEngine.instance,
          },
        ],
        before: (request, response) => {},
        after: (request, response) => {},
      } as RouterConfigInterface),

      new Router({
        name: "chasi",
        auth: false,
        prefix: "/chasi",
        namespace: "container/http/chasi.js",
        ControllerDir: ["container/controllers/"],
        middleware: [],
        AuthRouteExceptions: [],
        data: () => {
          return {
            abc: 321,
          };
        },
      } as RouterConfigInterface),
    ];
  }
}
