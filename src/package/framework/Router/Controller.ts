import { Iobject } from "../Interfaces.js";
import Service from "../Services/Service.js";

export default class Controller {
  static $compiler: any;
  static $services: { [key: string]: any };

  static init(services: any) {
    Controller.$services = services;
  }

  private _data_: Function = () => {};

  get $data() {
    return this._data_();
  }

  set $data(data) {
    this._data_ = data;
  }
}
