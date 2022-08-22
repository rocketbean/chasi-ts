import Service from "../Services/Service.js";

export default class Controller {
  static $compiler: any;
  static $services: { [key: string]: any };

  static init(services: any) {
    Controller.$services = services;
  }
}
