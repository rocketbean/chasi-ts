import Base from "../../Base.js";
import { RouterConfigInterface } from "../Interfaces.js";

export default class RouteCollector extends Base {
  protected $endpoints: string[] = [];
  protected $groups: [];
  protected namespace: Function;

  constructor(public property: RouterConfigInterface) {
    super();
    this.property = property;
  }

  async collectEndpoints() {
    this.namespace = await this.fetchFile(this.property.namespace);
    Reflect.apply(this.namespace, this, []);
  }
}
