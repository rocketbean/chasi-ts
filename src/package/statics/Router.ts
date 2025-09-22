import { RoutableInterface } from "../framework/Interfaces.js";
import { RouterConfigInterface } from "Chasi/Router";

import router from "../framework/Router/Router.js";
export default class Router extends router implements RoutableInterface {
  constructor(public property: RouterConfigInterface) {
    super(property);
  }
}
