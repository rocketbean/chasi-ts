import { RouteGroupProperty, paramType } from "Chasi/Router";
import { ObjectId } from "mongodb";
import Models, { ModelCollection } from "../Database/Models.js";
import Route from "./Route.js";
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

    spec: {},

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

  constructor(property: RouteGroupProperty, public $route: Route) {
    Object.assign(this.property, property);
    this.setParameters(this.property);
  }

  /**
   * Set route group parameters
   * for path parameters
   * to be used in openapi specifications.
   */
  setParameters(property: RouteGroupProperty): void {
    /**
     * get the specified database model
     * listed in the config
     */
    let routerModel = this.$route.$registry.property["database"] || "_";
    if (property?.spec) {
      //collects the models from the database
      let collection = Models["collection"][routerModel];
      if (property.prefix && property.prefix.includes(":")) {
        if (!property?.spec.parameters) property.spec.parameters = [];
        let str = property.prefix.split("/");
        str.forEach((s, i) => {
          if (!s.includes(":")) return;
          let name = s.replace(":", "");

          /**
           * Check if the parameter is a model
           * if it exists in the collection of model names
           * then it will automatically
           * add the parameter to the OpenAPI specification
           * as spec  as SwaggerJSdoc[parameter]
           */
          let isModel = Object.keys(collection)
            .map((k) => k.toLowerCase())
            .includes(name);

          let description = isModel
            ? `Index of Model Model::\[${name.toLocaleUpperCase()}\]`
            : "";
          let param = property.spec.parameters.find(
            (p: paramType) => p.name === name
          );

          if (!param) {
            property.spec.parameters.push({
              name: name,
              in: "path",
              schema: {
                type: "string",
              },
              required: true,
              description: description,
            });
          }
        });
      }
    }
  }
}
