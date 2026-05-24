import AsyncEventEmitter from "asynchronous-emitter";
import Base from "../Base.js";
import Writer from "../Logger/types/Writer.js";
import { EventInterface } from "./Event.js";
import Listener from "./Listener.js";

export type ObserverConfig = {
  events: events,
  beforeEmit: Function,
  afterEmit: Function
}

export type events = {
  [key: string]: string
}

/**
 * Observer - event handler class
 */
export default class Observer extends Base {
  /** 
  * Global Event registry
  */
  $events: { [key: string]: any } = {};

  /** 
  * handles async events
  */
  emitter: AsyncEventEmitter = new AsyncEventEmitter();

  /** 
  * Log Writer class
  */
  logger: Writer;

  constructor(private config: ObserverConfig) {
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
  async setup(): Promise<void> {
    await Promise.all(
      Object.keys(this.config.events).map(async (ev) => {
        await this.register(
          ev,
          new (await this.fetchFile(this.config.events[ev]) as new () => EventInterface)(),
        );
      }),
    );
  }

  async register(key: string, instance: EventInterface): Promise<events> {
    const onEmit: { beforeEmit?: Function; afterEmit?: Function } = {};
    if (typeof instance["beforeEmit"] !== "function")
      onEmit["beforeEmit"] = this.config.beforeEmit;
    if (typeof instance["afterEmit"] !== "function")
      onEmit["afterEmit"] = this.config.afterEmit;
    if (
      typeof instance["beforeEmit"] !== "function" ||
      typeof instance["afterEmit"] !== "function"
    ) {
      Reflect.set(instance, "props", onEmit, instance);
    }
    return await this.watch(key, instance);
  }

  async watch(key: string, instance: EventInterface): Promise<events> {
    this.$events[key] = instance;
    this.emitter.on(key, async (property: Record<string, unknown> = {}) => {
      Reflect.set(instance, "options", property);
      try {
        await instance.validate(property, async (): Promise<void> => {
          await instance.onemit();
          await instance.fire(property);
          await instance.fireListeners();
          await instance.emitted();
        });
      } catch (e: unknown) { /* event errors are surfaced via exception system */ }
    });
    return this.$events;
  }

  when(key: string, fn: (...args: unknown[]) => unknown, opts: Record<string, unknown> = {}): void {
    const ev = this.$events[key];
    const lis = new Listener(key, fn, opts);
    ev.listeners.push(lis);
  }

  async emit(event: string, params?: Record<string, unknown>): Promise<void> {
    await this.emitter.emit(event, params);
  }
}
