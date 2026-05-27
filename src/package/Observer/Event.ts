import Writer from "./../Logger/types/Writer.js";
import Listener from "./Listener.js";

/**
 * Contract for Observer event classes (custom and framework lifecycle events).
 *
 * Execution order on `emit()`: `validate` → `onemit` (global `beforeEmit`) →
 * `fire` → `fireListeners` (`when()` callbacks) → `emitted` (global `afterEmit`).
 */
export interface EventInterface {
  /** Injected global/per-event hooks (`beforeEmit`, `afterEmit`) */
  props: { [key: string]: any };
  logger: Writer;
  /** Listeners registered via `$observer.when()` */
  listeners: Listener[];
  /** Gate execution; must call `next()` to proceed to `fire()` */
  validate(a: any, b: Function);
  /** Main event handler — receives the emit payload */
  fire(a: any): void;
  fireListeners();
  emitted(): void;
  onemit(): void;
}

export default class Event {
  public props: { [key: string]: any } = {};
  logger: Writer = Logger.writer("StartTrace");
  public options: Record<string, unknown>;
  public listeners: Listener[] = [];

  async emitted(): Promise<void> {
    Reflect.apply(this.props.afterEmit, this, [this.options]);
  }

  async fireListeners(): Promise<void> {
    await Promise.all(
      this.listeners.map(async (ls) => {
        await ls.callback(ls.options.params, this.options);
      }),
    );
  }

  async onemit(): Promise<void> {
    Reflect.apply(this.props.beforeEmit, this, [this.options]);
  }
}
