import { RouterConfigInterface } from "../Interfaces.js";
import Collector from "./Collector.js";
import Registry from "./Registry.js";

export default class Router extends Collector {
  protected $registry: Registry = new Registry();

  constructor(public property: RouterConfigInterface) {
    super(property);
    this.property = property;
  }

  async set() {
    await this.collectEndpoints();
    console.log(this.namespace);
  }
}
