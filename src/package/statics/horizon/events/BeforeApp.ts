import Event from "./../../../Observer/Event.js";
import Database from "../../../framework/Database/Database.js";
import RouterModule from "./../../../framework/Router/RouterModule.js";
export default class BeforeApp extends Event {

  async validate(params: any, next: Function) {
    try {
      params.app.state = 1;
      params.database = await Database.init(params.app.config.database);
      await params.app.$app.setAuthLayer(params.app.config.authentication);
        params.routers = await RouterModule.init(
          params.app.$services.routers,
          params.app.config.container,
        );
      next();
    } catch (e: unknown) {
      Logger.log(e)
    }
  }

  /**
   * Installing Modules
   */
  async fire(params: any) {
    await params.app.installModule(params.routers);
    await params.app.installModule(params.database);
    await params.next();
  }
  async onemit() {}
  async emitted() {}
}
