import { RoutableInterface } from "../framework/Interfaces.js";
import { RouterConfigInterface } from "../framework/Interfaces.js";
import router from "../framework/Router/Router.js";
export default class Router extends router implements RoutableInterface {
  constructor(property: RouterConfigInterface) {
    super(property);
  }
}
