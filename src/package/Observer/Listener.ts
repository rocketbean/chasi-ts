import { Iobject } from "../framework/Interfaces.js";

export default class Listener {
  public options: Iobject = {
    fired: 0,
    limit: -1,
    params: {},
  };

  constructor(public ev: string, public callback, opts = {}) {
    this.options = Object.assign(this.options, opts);
  }
}
