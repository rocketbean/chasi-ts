import { Writable } from "../package/Logger/types/Writer.js";
import Event from "../package/Observer/Event.js";
let logger: Writable = Logger.writer();

export default {
  /**
   * Register your events here,
   * accesible in controllers via
   * [$observer] property.
   * you can fire the event by declaring:
   * this.$observer.emit(<event_name>:String)
   */
  events: {
    authorized: "container/events/Authorize",
  },
  /**
   * [beforeEmit] | [afterEmit] the Event fire() method
   * [onemit()] | [emitted()] method will be called
   * and can be overwritten inside your declared Event
   * class or by changingit here,
   * to apply in all of the registered event
   * [NOTE]: this method will refer to the
   * Event instance.
   */
  beforeEmit: async function (params) {
    logger.group(this.constructor.name);
  },
  afterEmit: async function (params) {
    logger.endGroup(this.constructor.name);
  },
};
