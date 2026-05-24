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
   *
   */
  // route.("/test", "v1/UserController@index");

  route.group({prefix: "/users"}, () => {
    route.post("/signin", "v1/UserController@signin");
    route.post("/signup", "v1/UserController@create");
    route.post("/forget", "v1/UserController@forget").middleware("testmode")
  })
};