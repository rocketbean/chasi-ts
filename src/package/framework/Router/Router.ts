import { RouterConfigInterface } from "../Interfaces.js";
import Collector from "./Collector.js";

export default class Router extends Collector {
  constructor(public property: RouterConfigInterface) {
    super(property);
    this.property = property;
  }

  async set() {
    await this.collectEndpoints();
  }
}
