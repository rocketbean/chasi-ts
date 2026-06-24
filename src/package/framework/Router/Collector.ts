import Base from "../../Base.js";
import Route from "./Route.js";
import Group from "./Group.js";
import Registry from "./Registry.js";
import * as methods from "./Methods/methods.js";
import { RouterConfigInterface } from "Chasi/Router";

export default class RouteCollector extends Base {
  protected $endpoints: string[] = [];
  protected $groups: Group[] = [];
  protected namespace: (route: Route) => void;
  $route: Route;
  $registry: Registry;
  // Introspection: the supported HTTP verbs, derived from the methods registry.
  private methods: string[];

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
  async collectEndpoints(): Promise<void> {
    this.namespace = await this.fetchFile(this.property.namespace) as (route: Route) => void;
    Reflect.apply(this.namespace, this, [this.$route]);
  }

  async collectEndpointFn(fn: (route: Route) => void): Promise<void> {
    Reflect.apply(fn, this, [this.$route]);
  }

  async init() {
    await this.$registry.loadControllers();
    await this.collectEndpoints();
  }
}
