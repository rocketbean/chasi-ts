import Router from "./Router.js";
import { ModuleInterface } from "../Interfaces.js";
import Collector from "./Collector.js";
import Route from "./Route.js";
export default class RouterModule implements ModuleInterface {
  constructor(public routers: Router[]) {}

  async collect() {
    await Promise.all(
      this.routers.map(async (router) => {
        return await router.set();
      }),
    );
  }

  async consume() {
    await Promise.all(
      this.routers.map(async (router: Router) => {
        try {
          await router.$registry.expand();
        } catch (e) {
          console.log(e, router.property);
        }
      }),
    );
  }

  async logRouter() {
    await Promise.all(
      this.routers.map(async (router) => {
        await router.log();
      }),
    );
  }

  static async init(routers: Router[], config: any) {
    Router.defaultControllerDir = config.ControllerDir;
    let module = new RouterModule(routers);
    await module.collect();
    await module.consume();
    await module.logRouter();
    return module;
  }
}
