import { exit } from "process";
import Event from "./../../../Observer/Event.js";

export default class AfterApp extends Event {
  /**
   *
   * @param {params} recieves the Event parameters
   * declared when the event is emitted
   * @param {next} [DO NOT FORGET TO CALL]
   * fired when validated
   */
  async validate(params, next) {
    params.app.state = 3;
    if (params.app.config.compiler.enabled)
      params.compiler = params.app.$services.compiler;
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
    let engine;
    if (params.app.config.compiler.enabled) {
      engine = await params.compiler.init(params.app.config.compiler);
      await params.app.installModule(engine);
    }
    await params.app.$app.consumeLayers(
      params.app.config.compiler,
      engine,
      engine?.driver,
    );
    await params.next();
  }

  async onemit() {}
  async emitted() {}
}
