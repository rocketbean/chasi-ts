import { appendFile } from "fs";
import Event from "./../../../Observer/Event.js";

export default class Exception extends Event {
  /**
   * @param {params} recieves the Event parameters
   *  declared when the event is emitted
   * @param {next} [DO NOT FORGET TO CALL]
   *  - fired when validated
   */
  async validate(params: any, next: Function) {
    next();
  }

  /**
   * called when the event  is emitted
   * all through out the Chasi Instance
   * @param {params}
   * contains the property that have
   * been passed on emit.
   */
  async fire(params: any) {}
  async onemit() {}
  async emitted() {}
}
