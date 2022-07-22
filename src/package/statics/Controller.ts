import controller from "../framework/Router/Controller.js";
export default class Controller extends controller {
  constructor() {
    super();
  }

  get services() {
    return Controller.$services;
  }

  get loadmodule() {
    return Controller.$services;
  }
}
