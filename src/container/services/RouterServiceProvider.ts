import {
  ServiceProviderInterface,
  RouterConfigInterface,
} from "../../package/framework/Interfaces.js";
import Router from "../../package/statics/Router.js";

export default class RouterServiceProvider implements ServiceProviderInterface {
  async boot() {
    return [
      new Router({
        name: "api",
        prefix: "/api",
        namespace: "container/http/api.js",
        ControllerDir: ["container/controllers/"],
        middleware: [],
        AuthRouteExceptions: [],
      } as RouterConfigInterface),
    ];
  }
}
