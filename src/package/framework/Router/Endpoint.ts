import { PathItem, RouteEndpointProperty } from "Chasi/Router";
import Controller from "./Controller.js";
import Group from "./Group.js";
import Exception from "../ErrorHandler/Exception.js";
import swaggerJSDoc from "swagger-jsdoc";
export default class Endpoint {
  public path: string = "";
  public uPath: string = "";
  public docPath: string = "";
  public isDynamic: boolean = false;
  public unmatched: boolean = false;
  public registered: boolean = false;
  public middlewares: string[] = [];
  public excludeFromMw: string[] = [];
  public $middlewares: Function[] = [];
  public beforeFns: Function[] = [];
  public afterFns: Function[] = [];
  public useAuth: Function;
  $controller: Controller;
  controller: string;
  $method: Function;
  method: string;
  exceptions: Exception[] = [];

  public spec: PathItem = {
    /** * @summary
     * a short description of the endpoint.
     * this will be used in the documentation
     * to provide a summary of the endpoint.
     */
    summary: "",
    /** * @tags
     * tags can be used to group endpoints
     * in the documentation.
     */
    tags: [],
    /** * @parameters
     * tags can be used to group endpoints
     * in the documentation.
     */
    parameters: [],
    responses: [],
  };

  constructor(public property: RouteEndpointProperty, public groups: Group[]) {
    this.property = property;
    this.groups = groups;
    this.setControllerMethod();
    this.defineEP();
  }

  /**
   * Get the endpoint definition
   * @returns {swaggerJSDoc[PathItem]}
   */
  get definition(): swaggerJSDoc.PathItem {
    return {
      [this.property.method]: {
        ...this.spec,
      },
    };
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

  /*** @defineEP
   * setups the endpoint definition
   * Controller [string][function]
   * @returns :void
   */
  defineEP(): void {
    if (this.property?.options && this.property?.options?.spec) {
      this.spec = this.property.options.spec;

      if (!this.spec?.tags) this.spec.tags = [];
      this.groups
        .filter((g) => g.property?.spec?.tags)
        .forEach((g) => this.spec.tags.push(...g.property.spec.tags));

      if (!this.spec?.parameters) this.spec.parameters = [];
      this.spec.parameters = this.spec?.parameters?.concat(
        this.groups
          .filter((g) => g.property?.spec?.parameters)
          .flatMap((g) => g.property.spec.parameters)
      );
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
    if (controllerPath.length > 1) {
      this.controller = controllerPath[0];
      this.method = controllerPath[1];
    } else this.method = controllerPath[0];
  }

  /***
   * threads the string controller
   * and dispatches the string to
   * the class[Endpoint] Vars
   * @params {exc} String | Array
   * @returns :void
   */
  except(exception: string | string[]) {
    if (Array.isArray(exception)) {
      exception.map((middleware: string): void => {
        this.middlewares.filter((mw) => mw != middleware);
        this.excludeFromMw.push(middleware);
      });
    } else if (typeof exception === "string") {
      this.middlewares.filter((mw) => mw != exception);
      this.excludeFromMw.push(exception);
    }
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
