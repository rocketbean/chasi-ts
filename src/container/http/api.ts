import Route from "../../package/statics/Route.js";
import specs from "./specs/api.spec.js"

export default (route: Route) => {
  
  route.group({ prefix: "/users" }, () => {
    route.post("/signin", "v1/UserController@signin", {
      spec: specs.signin,
    })
    route.post("/signup", "v1/UserController@create", {
      spec: specs.signup,
    });
    route.post("/forget", "v1/UserController@forget", {
      spec: specs.forget,
    }).middleware("testmode");
  });
};
