import Route from "../../package/statics/Route.js";
import specs from "./specs/api.spec.js"

export default (route: Route) => {
  route.group({ prefix: "/users" }, () => {
    route.post("/signin", "UserController@signin", {
      spec: specs.signin,
    })
    route.post("/signup", "UserController@create", {
      spec: specs.signup,
    });
  });
};
