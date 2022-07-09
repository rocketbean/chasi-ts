import { RouteProperty } from "../Interfaces.js";
import Group from "./Group.js";

export default class Route {
  protected static $registry;
  protected static groups: Group[] = [];
  protected groups: Group[] = [];
  protected $controller: string;
  protected $method: string;

  constructor(protected property: RouteProperty) {
    this.property = property;
    this.setControllerMethod();
    this.setGroups();
  }

  setGroups() {
    this.groups = [...Route.groups];
  }

  setControllerMethod() {
    this.$controller = this.property.controller.split("@")[0];
    this.$method = this.property.controller.split("@")[1];
  }

  /**
   *  Register a [delete] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static delete(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "delete",
      controller,
      endpoint,
      options,
    });
  }

  /**
   *  Register a [options] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static options(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "options",
      controller,
      endpoint,
      options,
    });
  }

  /**
   *  Register a [patch] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static patch(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "patch",
      controller,
      endpoint,
      options,
    });
  }
  /**
   *  Register a [put] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static put(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "put",
      controller,
      endpoint,
      options,
    });
  }

  /**
   *  Register a [search] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static search(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "search",
      controller,
      endpoint,
      options,
    });
  }

  /**
   *  Register a [Post] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static post(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "post",
      controller,
      endpoint,
      options,
    } as RouteProperty);
  }

  /**
   *  Register a [get] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static get(endpoint: string, controller: string, options = {}) {
    return new Route({
      method: "get",
      controller,
      endpoint,
      options,
    } as RouteProperty);
  }

  /**
   *  Register a [Post] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  static group(stack: any, fn: Function) {
    let group = Route.stackGroup(stack);
    fn();
    Route.removeGroupStack(group);
  }

  static stackGroup(stack) {
    let group = new Group(stack);
    Route.groups.push(group);
    return group;
  }

  static removeGroupStack(group) {
    Route.groups = Route.groups.filter(
      (_group: Group) => _group.id != group.id,
    );
  }
}
