import Event from "./../../../Observer/Event.js";
import Database from "../../../framework/Database/Database.js";
import RouterModule from "./../../../framework/Router/RouterModule.js";
import { Iobject } from "../../../framework/Interfaces.js";
export default class BeforeApp extends Event {

  async validate(params: Record<string, unknown>, next: () => void): Promise<void> {
    try {
      const app = params.app as Iobject;
      app.state = 1;
      params.database = await Database.init(app.config.database);
      await app.$app.setAuthLayer(app.config.authentication);
      params.routers = await RouterModule.init(
        app.$services.routers,
        app.config.container,
      );
      next();
    } catch (e: unknown) {
      Logger.log(e);
    }
  }

  async fire(params: Record<string, unknown>): Promise<void> {
    const app = params.app as Iobject;
    await app.installModule(params.routers);
    await app.installModule(params.database);
    await (params.next as Function)();
  }
  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
