import Group from "./Group.js";
import Registry from "./Registry.js";
import * as methods from "./Methods/methods.js";
import Endpoint from "./Endpoint.js";

export default class Route {
  groups: Group[] = [];
  constructor(public $registry: Registry) {
    this.$registry = $registry;
  }

  /**
   *  Register a [get] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  get(endpoint: string, controller: string | Function, options = {}): Endpoint {
    let ep = new Endpoint(
      {
        method: "get",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [Post] Method endpoint;
   * @param endpoint {string} path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  post(
    endpoint: string,
    controller: string | Function,
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method: "post",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [options] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  options(
    endpoint: string,
    controller: string | Function,
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method: "options",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [patch] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  patch(
    endpoint: string,
    controller: string | Function,
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method: "patch",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [put] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  put(endpoint: string, controller: string | Function, options = {}): Endpoint {
    let ep = new Endpoint(
      {
        method: "put",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [delete] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  delete(
    endpoint: string,
    controller: string | Function,
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method: "delete",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [search] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  search(
    endpoint: string,
    controller: string | Function,
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method: "search",
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    this.$registry.register(ep);
    return ep;
  }

  /**
   *  Register a [search] Method endpoint;
   * @param endpoint {string} | path url endpoint;
   * @param controller {string} controller and method to call when the endpoint is called;
   * @param options {object} options
   * @returns [Route] instance to be collected on boot
   */
  dynamic(
    endpoint: string,
    controller: string | Function,
    method: "string",
    options = {},
  ): Endpoint {
    let ep = new Endpoint(
      {
        method,
        controller,
        endpoint,
        options,
      },
      [...this.groups],
    );
    ep.unmatched = true;
    this.$registry.register(ep);
    return ep;
  }

  group(stack: any, fn: Function) {
    let _g = this.stackGroup(stack);
    fn();
    this.removeGroupStack(_g);
  }

  stackGroup(stack) {
    let stk = new Group(stack);
    this.groups.push(stk);
    return stk;
  }

  removeGroupStack(group: Group) {
    this.groups = this.groups.filter((_group: Group) => _group.id != group.id);
  }
}
