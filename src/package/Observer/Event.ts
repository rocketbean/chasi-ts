import Writer from "./../Logger/types/Writer.js";

export interface EventInterface {
  props: { [key: string]: any };
  logger: Writer;
  validate(a: any, b: Function);
  fire(a: any);
  emitted();
  onemit();
}

export default class Event {
  public props: { [key: string]: any } = {};
  logger: Writer = Logger.writer("StartTrace");
  public options: any;

  async emitted() {
    Reflect.apply(this.props.afterEmit, this, [this.options]);
  }

  async onemit() {
    Reflect.apply(this.props.beforeEmit, this, [this.options]);
  }
}
