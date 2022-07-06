import Event from "./../../../Observer/Event.js";
import Database from "../../../framework/Database/Database.js";
import RouterModule from "./../../../framework/Router/RouterModule.js";
export default class BeforeApp extends Event {
  async validate(params, next) {
    next();
  }
  /**
   * Installing Modules
   */
  async fire(params) {
    await params.app.installModule(new Database());
    await params.app.installModule(
      await RouterModule.init(params.app.$services.routers),
    );
    await params.next();
  }
  async onemit() {}
  async emitted() {}
}
