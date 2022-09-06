import { RouteEndpointProperty } from "../Interfaces.js";
import Controller from "./Controller.js";
import Router from "./Router.js";
import Group from "./Group.js";
import Exception from "../ErrorHandler/Exception.js";
export default class Endpoint {
  public path: string = "";
  public isDynamic: boolean = false;
  public middlewares: string[] = [];
  public $middlewares: Function[] = [];
  public beforeFns: Function[] = [];
  public afterFns: Function[] = [];
  public useAuth: Function;
  $controller: Controller;
  controller: string;
  $method: Function;
  method: string;
  exceptions: Exception[] = [];

  constructor(public property: RouteEndpointProperty, public groups: Group[]) {
    this.property = property;
    this.groups = groups;
    this.setControllerMethod();
  }
  /***
   * defines the type of
   * Controller [string][function]
   * @returns :void
   */
  setControllerMethod() {
    if (typeof this.property.controller == "string") {
      this.handleStringController(this.property.controller);
    } else {
      this.handleFunctionController(this.property.controller as Function);
    }
  }

  addException(exc: Exception) {
    this.exceptions.push(exc);
  }

  /***
   * threads the string controller
   * and dispatches the string to
   * the class[Endpoint] Vars
   * @params [str] String Controller path and method
   * @returns :void
   */
  handleStringController(str: string) {
    let controllerPath = str.split("@");
    this.controller = controllerPath[0];
    this.method = controllerPath[1];
  }

  middleware(mw: string | string[]) {
    if (typeof mw === "string") mw = [mw];
    this.middlewares = mw;
  }

  /***
   * threads the string controller
   * and dispatches the string to
   * the class[Endpoint] Vars
   * @params [str] String Controller path and method
   * @returns :void
   */
  handleFunctionController(fn: Function) {
    this.$method = fn;
    this.controller = "Function";
    this.method = "Function";
  }

  pushMiddleware(fn: string) {
    this.middlewares.unshift(fn);
  }

  pushBefore(fn: Function) {
    this.beforeFns.push(fn);
  }

  pushAfter(fn: Function) {
    this.afterFns.push(fn);
  }

  addExceptions(exception: Exception) {
    this.exceptions.push(exception);
  }
}
