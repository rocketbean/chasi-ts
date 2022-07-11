import Controller from "./Controller.js";
import Endpoint from "./Endpoint.js";
import Group from "./Group.js";
import Router from "./Router.js";
import Base from "../../Base.js";
import { RouterConfigInterface } from "../Interfaces.js";

export default class Registry extends Base {
  controllers: Controller[] = [];
  routes: Endpoint[] = [];

  constructor(public property: RouterConfigInterface) {
    super();
    this.property = property;
  }

  async loadControllers() {
    if (Array.isArray(this.property.ControllerDir)) {
      await Promise.all(
        this.property.ControllerDir.map(async (dir) => {
          await this.registerControllerDir(dir);
        }),
      );
    }
  }

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

  /**
   * Registers an enpoint
   * @param endpoint
   */
  async register(endpoint: Endpoint) {
    await this.routes.push(endpoint);
  }

  /**
   * expanding each routes [routes[]]
   * and consuming Group and Router Layers
   * aligning properties
   * [middleware][before][after][prefix]
   */
  async expand() {
    await Promise.all(
      this.routes.map(async (ep: Endpoint) => {
        try {
          await this.setRouterLayer(ep);
          await this.consumeRouteGroup(ep);
          this.constructEndpoint(ep);
          this.bindMethods(ep);
        } catch (e) {
          console.log(ep, `@error on ep collect: ${this.property.name}`);
        }
      }),
    );
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
   * Route consuming Groups Layer
   */
  async consumeRouteGroup(ep: Endpoint) {
    if (ep.groups.length > 0) {
      await Promise.all(
        ep.groups.map(async (group: Group) => {
          this.constructRoutePath(ep, group);
          this.constructControllerPath(ep, group);
          this.constructBeforeFn(ep, group);
          this.constructAfterFn(ep, group);
        }),
      );
    }
  }

  bindMethods(ep: Endpoint) {
    if (!ep.controller.includes("/")) {
      ep.controller = Router.defaultControllerDir + "/" + ep.controller;
    }
    let controller = Object.keys(Router.Controllers).find((key) =>
      key.toLowerCase().includes(ep.controller.toLowerCase()),
    );
    ep.$controller = Router.Controllers[controller].instance;
    ep.$method = Router.Controllers[controller].instance[ep.method];
  }

  constructEndpoint(ep: Endpoint) {
    ep.property.endpoint = ep.property.endpoint.replace(/\//g, "");
    ep.path += "/" + ep.property.endpoint;
  }

  constructRouterEp(ep: Endpoint) {
    this.property.prefix = this.property.prefix.replace(/\//g, "");
    ep.path += "/" + this.property.prefix;
  }

  constructRoutePath(ep: Endpoint, group: Group) {
    group.property.prefix = group.property.prefix.replace(/\//g, "");
    ep.path += "/" + group.property.prefix;
  }

  constructControllerPath(ep: Endpoint, group: Group) {
    group.property.controller = group.property.controller.replace(/\//g, "");
    ep.controller = group.property.controller + "/" + ep.controller;
  }

  constructBeforeFn(ep: Endpoint, group: Group) {
    ep.pushBefore(group.property.before);
  }

  constructAfterFn(ep: Endpoint, group: Group) {
    ep.pushAfter(group.property.after);
  }
}
