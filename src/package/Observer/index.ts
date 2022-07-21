import AsyncEventEmitter from "asynchronous-emitter";
import Base from "../Base.js";
import Writer from "../Logger/types/Writer.js";
import Event, { EventInterface } from "./Event.js";
import { Iobject } from "./../framework/Interfaces.js";

export default class Observer extends Base {
  $events: { [key: string]: any } = {};
  emitter: AsyncEventEmitter = new AsyncEventEmitter();
  logger: Writer;

  constructor(private config: Iobject) {
    super();
    this.config = config;
    this.logger = Logger.writer();
  }

  /**
   * Setting up the observer;
   * Registers the List from
   * config [EventRegistry]
   * @returns :void
   */
  async setup() {
    await Promise.all(
      Object.keys(this.config.events).map(async (ev) => {
        await this.register(
          ev,
          new (await this.fetchFile(this.config.events[ev]))(),
        );
      }),
    );
  }

  /**
   * validating before and after
   * emit handlers from the instance
   * adding the default.
   * @param key {string} instance key
   * @param instance {EventInterface} Event instance
   * @returns Observer.watch
   */
  async register(key: string, instance: EventInterface): Promise<object> {
    let onEmit: { [key: string]: any } = {};
    if (typeof instance["beforeEmit"] !== "function")
      onEmit["beforeEmit"] = <Event>this.config.beforeEmit;
    if (typeof instance["afterEmit"] !== "function")
      onEmit["afterEmit"] = <Event>this.config.afterEmit;
    if (
      typeof instance["beforeEmit"] !== "function" ||
      typeof instance["afterEmit"] !== "function"
    ) {
      Reflect.set(instance, "props", onEmit, instance);
    }
    return await this.watch(key, instance);
  }

  /**
   * Initial registration to EventEmitter/Listener
   * <emitter>
   * @param key {string} instance key
   * @param instance {EventInterface} Event instance
   * @returns Observer.$events
   */
  async watch(key: string, instance: EventInterface) {
    this.$events[key] = instance;
    this.emitter.on(key, async (property: any = {}) => {
      Reflect.set(instance, "options", property);
      try {
        await instance.validate(property, async (): Promise<void> => {
          await instance.onemit();
          await instance.fire(property);
          await instance.emitted();
        });
      } catch (e) {}
    });
    return this.$events;
  }

  async emit(event: string, params?: any) {
    await this.emitter.emit(event, params);
  }
}
