import { Writable } from "../package/Logger/types/Writer.js";
import { ObserverConfig } from "../package/Observer/index.js";

let logger: Writable = Logger.writer();

export default <ObserverConfig>{
  /**
   * Named event registry.
   * Maps an event alias to the path of its Event class file
   * (relative to `src/`, resolved at boot time).
   *
   * Once registered, fire an event anywhere inside a controller with:
   *   `this.$observer.emit("authorized", { ...payload })`
   *
   * Each event class must implement the `EventInterface` (see `package/Observer/Event.ts`).
   * Add new events here to have them auto-registered during startup.
   */
  events: {
    authorized: "container/events/Authorize",
  },

  /**
   * Global hook called just before every event's `fire()` method executes.
   * Applies to all registered events unless the event class overrides `onemit()`.
   * Use this to inject cross-cutting logic (logging, tracing, validation setup)
   * without touching individual event files.
   *
   * `this` inside the function refers to the Event instance.
   * `params` is the payload passed to `$observer.emit(...)`.
   */
  beforeEmit: async function (params) {},

  /**
   * Global hook called just after every event's `fire()` method completes.
   * Applies to all registered events unless the event class overrides `emitted()`.
   * Use this for post-event cleanup, audit logging, or metric recording.
   *
   * `this` inside the function refers to the Event instance.
   * `params` is the same payload that was passed to `$observer.emit(...)`.
   */
  afterEmit: async function (params) {},
};
