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
  route.get("/test2", "UserController@index");
  route.group({ prefix: "123", controller: "controllers2" }, () => {
    route.post("321", "UserController@index");
  });

  route.search("/search", "UserController@search");
  route.group(
    {
      prefix: "group1",
      before: async () => {
        console.log("on group 1");
      },
    },
    function () {
      route.post("/test", "UserController@index");
      route.group({ prefix: "group2" }, function () {
        route.post("test2", "UserController@index");
        route.group({ prefix: "group3" }, function () {
          route.patch("ongroup3", "UserController@index");
        });
      });
      route.get("/test2", "UserController@index");
    },
  );
  route.post("/1", "UserController@index");
};
