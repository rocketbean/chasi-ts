import Route from "./Route.js";
import Group from "./Group.js";
export default class Registry {
  routeCollection: Route[] = [];

  register(route: Route) {
    this.routeCollection.push(route);
  }
}
