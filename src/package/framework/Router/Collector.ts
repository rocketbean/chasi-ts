import Base from "../../Base.js";
import Route from "./Route.js";
import Registry from "./Registry.js";
import * as methods from "./Methods/methods.js";
import { RouterConfigInterface, RouteMethodsInterface } from "../Interfaces.js";

export default class RouteCollector extends Base {
  protected $endpoints: string[] = [];
  protected $groups: [];
  protected namespace: Function;
  private methods: string[];
  private $registry: Registry = new Registry();

  private methodHandler: {} = {
    apply: (target, thisArg, ArgList: any) => {
      this.$registry.register(
        target(...(ArgList as [string, string, object?])),
      );
    },
  };

  constructor(public property: RouterConfigInterface) {
    super();
    this.property = property;
    this.methods = Object.keys(methods.default).map((m: string) => {
      return m.toLowerCase();
    });
  }

  /***
   * META Program
   * [reflect|proxy]
   */
  async collectEndpoints() {
    this.redefineMethods();
    this.namespace = await this.fetchFile(this.property.namespace);
    Reflect.apply(this.namespace, this, []);
  }

  /***
   * META re assigning methods
   * get the Registered methods at "./Methods"
   * and re assign static method
   * [reflect|proxy]
   */
  redefineMethods() {
    this.methods.forEach((method) => {
      if (Reflect.ownKeys(Route).includes(method))
        Reflect.set(
          Route,
          method,
          new Proxy(Route[method], this.methodHandler),
        );
    });
  }
}
