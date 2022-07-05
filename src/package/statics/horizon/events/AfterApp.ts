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
