import controller from "../framework/Router/Controller.js";
import model from "./Model.js";
export default class Controller extends controller {
  constructor() {
    super();
  }

  get compiler() {
    return Controller.$compiler;
  }

  get models() {
    return model.collection;
  }

  get services() {
    return Controller.$services;
  }
}
