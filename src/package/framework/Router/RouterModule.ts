import Router from "./Router.js";
import { ModuleInterface } from "../Interfaces.js";
import Collector from "./Collector.js";
export default class RouterModule implements ModuleInterface {
  constructor(public routers: Router[]) {}

  async collect() {
    return Promise.all(
      this.routers.map(async (router) => {
        await router.set();
      }),
    );
  }

  static async init(routers: Router[]) {
    let module = new RouterModule(routers);
    await module.collect();
    return module;
  }
}
