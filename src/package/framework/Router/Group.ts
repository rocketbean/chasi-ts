import { RouteGroupProperty } from "../Interfaces.js";
import { ObjectId } from "mongodb";
export default class Group {
  public property: RouteGroupProperty = {
    /** RouteGroup Middleware
     * middlewares listed under this group
     * will be implemented across the group endpoints
     */
    middleware: [],

    /** RouteGroup prefix
     * value will be prepended to
     * the endpoint path.
     */
    prefix: "",

    /** RouteGroup controller
     * controller path must be under
     * ./config/container.ts[ControllerDir]
     * path declaration.
     * 
     * can be shorthanded if '@' is present
     * before the file declaration
     * e.g. : "posts@PostController"
     * then your routes can be shorthanded as
     * route.post("index", "index");
     * ** this will translate to
     * (posts/PostController@index)
     */
    controller: "",

    /** RouteGroup before event
     * before() will be emitted before
     * function/controller execution.
     */
    before: async (): Promise<void> => {},

    /** RouteGroup after event
     * after() will be emitted before
     * sending a response object 
     * to the client
     */
    after: async (): Promise<void> => {},
  };

  id: string = new ObjectId().toString();

  constructor(property: RouteGroupProperty) {
    Object.assign(this.property, property);
  }
}
