import Route from "../../package/statics/Route.js";

export default (route: Route) => {
  /* * * * * * * * * *  Route Endpoint Registry * * * * * * *
   * this registry will serve as the routing container,
   * please make sure that this is registered in
   * [container/services/RouterServiceProvider]
   * also check [config/authentication.js] ,
   * by default, API's that is registered through auth config,
   * will be protected by JWT unless registered in
   * [AuthRouteExceptions] array option.
   */

  route.get("/", "UserController@search");
  route.search("/search", "UserController@search");
  route.group({ prefix: "users", middleware: "user" }, () => {
    route.post("/", "UserController@create");
    route.get("/", "UserController@index");
    route.get(":user", "UserController@welcome");
  });
  route.post("/1", "UserController@index");
};
