import Base from "../../Base.js";
import Route from "./Route.js";
import Registry from "./Registry.js";
import * as methods from "./Methods/methods.js";
import { RouterConfigInterface } from "Chasi/Router";

export default class RouteCollector extends Base {
  protected $endpoints: string[] = [];
  protected $groups: [];
  protected namespace: Function;
  private methods: string[];
  $route: Route;
  $registry: Registry;

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
    this.$registry = new Registry(property);
    this.$route = new Route(this.$registry);
    this.methods = Object.keys(methods.default).map((m: string) => {
      return m.toLowerCase();
    });
  }

  /***
   * META Program
   * [reflect|proxy]
   */
  async collectEndpoints() {
    this.namespace = await this.fetchFile(this.property.namespace);
    Reflect.apply(this.namespace, this, [this.$route]);
  }

  /***
   * META Program
   * [reflect|proxy]
   */
  async collectEndpointFn(fn: any) {
    Reflect.apply(fn, this, [this.$route]);
  }

  async init() {
    await this.$registry.loadControllers();
    await this.collectEndpoints();
  }
}
