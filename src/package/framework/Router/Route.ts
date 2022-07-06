import { RouteProperty } from "../Interfaces.js";

export default class Route {
  protected static register;
  protected $controller: string;
  protected $method: string;

  constructor(protected property: RouteProperty) {
    this.property = property;
  }

  setControllerMethod() {
    this.$controller = this.property.controller.split("@")[0];
    this.$method = this.property.controller.split("@")[1];
  }

  /**
   *  Register a [Get] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static get(endpoint: string, controller: string, options = {}) {
    let route = new Route({
      method: "get",
      controller,
      endpoint,
      options,
    });
    return route;
  }

  /**
   *  Register a [Post] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static post(endpoint: string, controller: string, options = {}) {
    let route = new Route({
      method: "post",
      controller,
      endpoint,
      options,
    } as RouteProperty);
    return route;
  }
}
