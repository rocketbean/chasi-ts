import controller from "../framework/Router/Controller.js";
export default class Controller extends controller {
  constructor() {
    super();
  }

  get sumthing() {
    return "something";
  }

  get services() {
    return Controller.$services;
  }

  get loadModule() {
    return this.services.loadModule;
  }
}
