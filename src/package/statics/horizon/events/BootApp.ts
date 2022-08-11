import Event from "./../../../Observer/Event.js";

export default class BootApp extends Event {
  /**
   *
   * @param {params} recieves the Event parameters
   * declared when the event is emitted
   * @param {next} [DO NOT FORGET TO CALL]
   * fired when validated
   */
  async validate(params, next) {
    params.app.state = 4;
    // params.compiler = params.app.$services.compiler;
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
    // await params.app.installModule(
    //   await params.compiler.init(params.app.config.compiler),
    // );
    await params.next();
  }
  async onemit() {}
  async emitted() {}
}
