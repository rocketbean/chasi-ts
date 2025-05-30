import Controller from "./Controller.js";
import Endpoint from "./Endpoint.js";
import Group from "./Group.js";
import Router from "./Router.js";
import Base from "../../Base.js";
import { RouterConfigInterface } from "Chasi/Router";
import Authentication from "../Server/Authentication.js";
export default class Registry extends Base {
  controllers: Controller[] = [];
  routes: Endpoint[] = [];
  middlewares: Function[] = [];

  constructor(public property: RouterConfigInterface) {
    super();
    this.property = property;
  }

  /***
   * collecting Controller resource
   * registered from RouteService Container
   */
  async loadControllers() {
    if (Array.isArray(this.property.ControllerDir)) {
      await Promise.all(
        this.property.ControllerDir.map(async (dir) => {
          await this.registerControllerDir(dir);
        }),
      );
    }
  }

  /***
   * fetch and invokes the [Controller]class
   * @param dir Controller directory
   */
  async registerControllerDir(dir: string) {
    let controllers = await this.NamespacedfetchFilesFromDir(dir);
    await Promise.all(
      Object.keys(controllers).map(async (key) => {
        let controller = new controllers[key]();
        if (controller instanceof Controller) {
          await Router.registerController(key, controller);
        }
      }),
    );
  }

  /***
   * Registers an enpoint
   * • [Registry]instance
   * • assign authentication driver
   * @param endpoint
   */
  async register(endpoint: Endpoint) {
    if (
      !this.property.auth ||
      this.property.auth === null ||
      this.property.auth === ""
    )
      endpoint.useAuth = (req, res, next) => {
        next();
      };
    else {
      this.attachAuthToEndpoint(endpoint);
    }
    await this.routes.push(endpoint);
  }

  /***
   * validate and assigns
   * the Authentication[Driver][authorize] method
   * which should return a function
   * to be used as route[middleware]
   * @param endpoint Endpoint class instance
   */
  attachAuthToEndpoint(endpoint: Endpoint) {
    let driver = Authentication.$drivers[this.property.auth as string];
    if (!driver)
      Caveat.handle(`missing Authentication driver ${this.property.auth}`);
    endpoint.useAuth = driver.authorize(
      endpoint,
      this.property.AuthRouteExceptions,
    );
  }

  /***
   * expanding each routes [routes[]]
   * and consuming Group and Router Layers
   * aligning properties
   * [middleware][before][after][prefix]
   */
  async expand() {
    await Promise.all(
      this.routes.map(async (ep: Endpoint, index: number) => {
        if (!ep.registered) {
          try {
            await this.setRouterLayer(ep);
            await this.consumeRouteGroup(ep);
            this.constructEndpoint(ep);
            this.bindMiddlewares(ep);
            this.bindMethods(ep);
            ep.path = ep.path.replace("//", "/");
            ep.uPath = ep.property.method + ep.path.replace("//", "/");
            this.pullDynamicRoute(ep);
            ep.registered = true;
          } catch (e) {
            Caveat.handle({ message: e, interpose: 2 });
          }
        }
      }),
    );
  }

  pullDynamicRoute(ep: Endpoint) {
    if (ep.uPath.includes(":")) {
      ep.isDynamic = true;
      this.routes = this.routes.filter((e) => e.uPath !== ep.uPath);
      this.routes.push(ep);
    }
  }

  /***
   * Route consuming Router Layer
   */
  async setRouterLayer(ep: Endpoint) {
    this.constructRouterEp(ep);
    if ("before" in this.property) ep.pushBefore(this.property.before);
    if ("after" in this.property) ep.pushAfter(this.property.after);
  }

  /***
   * Bind Middlewares from
   * Route Container layer
   */
  async bindMiddlewares(ep) {
    if ("middleware" in this.property) {
      if (typeof this.property.middleware === "string") {
        this.property.middleware = [this.property.middleware];
      }
      this.property.middleware.forEach((mw: string) => ep.pushMiddleware(mw));
    }
    ep.middlewares.map((mw: string) => {
      if (!(mw in Router.Middlewares)) {
        ep.addException(
          Caveat.handle({
            message: `undefined Middleware ${mw}`,
            interpose: 2,
            showStack: false,
            hide: true,
          }),
        );
      } else {
        if(!ep.excludeFromMw.includes(mw))
          ep.$middlewares.push(Router.Middlewares[mw])
      };
    });
  }

  /***
   * Route consuming Groups Layer
   *
   */
  async consumeRouteGroup(ep: Endpoint) {
    if (ep.groups.length > 0) {
      await Promise.all(
        ep.groups.map(async (group: Group) => {
          this.constructRoutePath(ep, group);
          this.constructMiddleware(ep, group);
          this.constructControllerPath(ep, group);
          this.constructBeforeFn(ep, group);
          this.constructAfterFn(ep, group);
        }),
      );
    }
  }

  /***
   * binding [Controller]class and method
   * connected to the [Endpoint]class
   * if the route is appointed to a controller
   * @param ep [Endpoint] class that handles the route
   */
  bindMethods(ep: Endpoint) {
    try {
      if (typeof ep.property.controller == "string") {
        if (!ep.controller.includes("/")) {
          ep.controller = Router.defaultControllerDir + "/" + ep.controller;
        }

        let controller = Object.keys(Router.Controllers).find((key) => 
          key.toLowerCase().includes(ep.controller.toLowerCase()));
        ep.$controller = Router.Controllers[controller].instance;
        ep.$method = Router.Controllers[controller].instance[ep.method].bind(
          Router.Controllers[controller].instance,
        );
      }
    } catch (e) {
      ep.addException(
        Caveat.handle({
          message: `Error Binding ControllerMethods ${ep.controller}::${ep.method} `,
          interpose: 2,
          showStack: true,
        }),
      );
    }
  }

  /***
   * binding [Controller]class and method
   * connected to the [Endpoint]class
   * if the route is appointed to a controller
   * @param ep [Endpoint] class that handles the route
   */
  sanitizeRoute(str: string, log: boolean = false) {
    let length = str.length;
    if (str[0] === "/") str = str.substring(1, str.length);
    if (str[length - 1] === "/") {
      str = str.slice(0, length - 1);
    }
    return str;
  }

  constructEndpoint(ep: Endpoint) {
    ep.property.endpoint = this.sanitizeRoute(ep.property.endpoint);
    ep.path += "/" + ep.property.endpoint;
    ep.path = "/" + ep.path.split("/").filter(p => p !== '').join('/')

  }

  constructRouterEp(ep: Endpoint) {
    this.property.prefix = this.sanitizeRoute(this.property.prefix);
    ep.path += "/" + this.property.prefix;
  }

  constructRoutePath(ep: Endpoint, group: Group) {
    this.sanitizeRoute(group.property.prefix, true),
      (group.property.prefix = this.sanitizeRoute(group.property.prefix));
    ep.path += "/" + group.property.prefix;

  }

  constructControllerPath(ep: Endpoint, group: Group) {
    if (group.property.controller != "") {
      let controllerPath = group.property.controller.split("@");
      if(controllerPath.length > 1) {
        if(!ep.controller) {
          ep.property.controller = `${controllerPath[1]}@${ep.property.controller}`;
          ep.controller = `${controllerPath[1]}`;
        }

      };
      ep.controller = controllerPath[0] + "/" + ep.controller;
    }
  }

  constructMiddleware(ep: Endpoint, group: Group) {
    if (typeof group.property.middleware === "string") {
      group.property.middleware = [group.property.middleware];
    }
    group.property.middleware.map((mw: string) => {
      ep.pushMiddleware(mw);
    });
  }

  constructBeforeFn(ep: Endpoint, group: Group) {
    ep.pushBefore(group.property.before);
  }

  constructAfterFn(ep: Endpoint, group: Group) {
    ep.pushAfter(group.property.after);
  }
}
