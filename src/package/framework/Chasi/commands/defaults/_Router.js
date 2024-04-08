import path from "path";

export default {
  name: "router",
  defaultPath: "./src/container/http",
  options: {
    params: { name: "" },
  },
  pre: function (filename) {
    let _m = {};
    let fn = filename.split("/").pop();
    _m["name"] = fn.capitalize();
    _m["ext"] = ".ts";
    _m["path"] = path.join(this.defaultPath, _m["name"] + _m["ext"]);
    _m["service"] = this.name;

    return Object.assign(this.options.params, _m);
  },
  process: function (filename) {
    this.params = this.pre(filename);
    return {
      params: this.params,
      template: this.template(this.params),
    };
  },
  template: (model) => {
    return `import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  /* * * * * * * * * *  Route Endpoint Registry * * * * * * *
    * this registry will serve as the routing container,
    * please make sure that this is registered in
    * [container/services/RouterServiceProvider]
    * also check [config/authentication.js] ,
    * by default, API's that is registered through auth config,
    * will be protected by JWT unless registered in
    * [AuthRouteExceptions] array option.
    *
    */

  route.get("/", (request: Request, response: Response) => {
    return "Welcome";
  });
}`;
  },
};
