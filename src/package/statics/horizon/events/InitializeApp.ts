import Event from "./../../../Observer/Event.js";
import RouterModule from "../../../framework/Router/RouterModule.js";
export default class InitializeApp extends Event {
  /**
   *
   * @param {params} recieves the Event parameters
   * declared when the event is emitted
   * @param {next} [DO NOT FORGET TO CALL]
   * fired when validated
   */
  async validate(params, next) {
    // console.log(params.app.$app);
    let routers = <RouterModule>params.app.$modules.RouterModule;
    params.app.$app.$routers = routers.routers;
    await params.app.$app.consumeLayers();
    // await params.app.consumeLayers();

    next();
  }

  /**
   * called when the event  is emitted
   * all through out the Chasi Instance
   * @param {params}
   * contains the property that have
   * been passed on emit.
   */
  async fire(params) {
    await params.next();
  }
  async onemit() {}
  async emitted() {}
}
