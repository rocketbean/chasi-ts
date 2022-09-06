import Writer from "./../Logger/types/Writer.js";
import Listener from "./Listener.js";

export interface EventInterface {
  props: { [key: string]: any };
  logger: Writer;
  listeners: Listener[];
  validate(a: any, b: Function);
  fire(a: any): void;
  fireListeners();
  emitted(): void;
  onemit(): void;
}

export default class Event {
  public props: { [key: string]: any } = {};
  logger: Writer = Logger.writer("StartTrace");
  public options: any;
  public listeners: Listener[] = [];

  async emitted() {
    Reflect.apply(this.props.afterEmit, this, [this.options]);
  }

  async fireListeners() {
    await Promise.all(
      this.listeners.map(async (ls) => {
        await ls.callback(ls.options.params, this.options);
      }),
    );
  }

  async onemit() {
    Reflect.apply(this.props.beforeEmit, this, [this.options]);
  }
}
