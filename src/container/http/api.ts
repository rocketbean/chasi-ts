import route from "../../package/statics/Route.js";

export default () => {
  /* * * * * * * * * *  Route Endpoint Registry * * * * * * *
   * this registry will serve as the routing container,
   * please make sure that this is registered in
   * [container/services/RouterServiceProvider]
   * also check [config/authentication.js] ,
   * by default, API's that is registered through auth config,
   * will be protected by JWT unless registered in
   * [AuthRouteExceptions] array option.
   */
  route.get("/", "UserController@index");
};
