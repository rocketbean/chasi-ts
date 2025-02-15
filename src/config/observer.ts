import { Writable } from "../package/Logger/types/Writer.js";
let logger: Writable = Logger.writer();

export default {
  /** events -
   * Register your events here,
   * accesible in controllers via
   * [$observer] property.
   * you can fire the event by declaring:
   * this.$observer.emit(<event_name>:String)
   */
  events: {
    authorized: "container/events/Authorize",
  },
  /** beforeEmit, afterEmit -
   * [beforeEmit] | [afterEmit] the Event fire() method
   * [onemit()] | [emitted()] method will be called
   * and can be overwritten inside your declared Event
   * class or by changing it here,
   * to apply in all of the registered event
   * [NOTE]: this method will refer to the
   * Event instance.
   */
  beforeEmit: async function (params) { },
  afterEmit: async function (params) { },
};
