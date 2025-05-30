declare module "Chasi/Router" {
  import { Iobject } from "../Interfaces.js";
  import Router from "./Router.js";

  export type RouterMethods =
    | "get"
    | "post"
    | "options"
    | "patch"
    | "put"
    | "search"
    | "delete";

  export type RouteExceptions = {
    /** @RouteExceptions.url
     * string path of the targeted endpoint
     */
    url: string;

    /** @RouteExceptions.m
     * RouterMethods
     * e.g. Post, Get, etc.
     */
    m: RouterMethods;
  };

  export interface RouteMethodsInterface {}

  export interface RouterMountableInterface {
    mount(router: Router, a: any);
  }

  export type RouteEndpointProperty = {
    method: string;
    controller: string | Function;
    endpoint: string;
    options: any;
  };

  export type RouterMountable = {
    name?: string;
    props?: any[];
    exec: RouterMountableInterface;
  };

  export type RouterConfigInterface = {
    /** *name*
     * Router's name
     * can be used as an index
     */
    name: string;

    /** *auth*
     * authentication can be configured from
     * [./config/authentication]
     * please specify a driver that is registered
     * from the auth configuration file
     * or you can set this parameter to
     * false || null, if you intend not
     * to use any auth for your router
     * {String} {Boolean[false]} {null}
     */
    auth: string | boolean | null;
    /** *prefix
     * prefix[string]
     * will be appended to all the routes
     * registered from the namespace.
     */
    prefix: string;

    /** *namespace
     * a string path to a router container file.
     */
    namespace: string;

    /** *middleware
     * middleware/s listed under this property will be implemented,
     * to all the routes
     * registered in the instance,
     * <strong>except*</strong> if the route
     * endpoint/group have a declaration of a middleware excemption
     */
    middleware: string | string[];

    /** *ControllerDir
     * a string path/s that will be added
     * to router's controller path registry.
     */
    ControllerDir: string | string[];

    /** ?AuthRouteExceptions
     * Option to excempt a route endpoint/s from AuthGuards,
     * all routes that will be excempted in Auth implementations will have
     * the [request.auth] property in the <Request>
     */
    AuthRouteExceptions?: RouteExceptions[];

    /** ?data
     * @data [Router Hook]
     * declared data inside this hook
     * will be avilable throughout
     * this Router[Instance]
     * you can access data property
     * via this.$data inside a controller/method
     * or by adding a 3rd argument in a
     * route function
     */
    data?: () => Iobject;

    /** ?mount
     * a router hook where third party modules
     * can be registered/mounted
     * @params <RouterMountable[]>
     */
    mount?: RouterMountable[];

    /** ?before
     * @before [Router Hook]
     * this function will be invoked
     * before a request is passed
     * into controller/handler function.
     */
    before?: (request?: any, response?: any, data?: any) => void;

    /** ?after
     * @after [Router Hook]
     * this function will be invoked
     * before a response
     * is sent back.
     */
    after?: (request?: any, response?: any, data?: any) => void;

    /** ?displayLog
     * [0] to disable router logs
     * [1] to enable router logs
     */
    displayLog?: 0 | 1;
  };

  export type RouteGroupProperty = {
    /** RouteGroup Middleware
     * middlewares listed under this group
     * will be implemented across the group endpoints
     */
    middleware?: string[];

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
    controller?: string;

    /** RouteGroup prefix
     * value will be prepended to
     * the endpoint path.
     */
    prefix?: string;

    /** RouteGroup before event
     * before() will be emitted before
     * function/controller execution.
     */
    before?: (request?: any, response?: any, data?: any) => {};

    /** RouteGroup after event
     * after() will be emitted before
     * sending a response object
     * to the client
     */
    after?: (request?: any, response?: any, data?: any) => {};
  };
}
