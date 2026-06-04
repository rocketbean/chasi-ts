declare module "Chasi/Router" {
  import { Iobject } from "../Interfaces.js";
  import Router from "./Router.js";
  import swaggerJsDoc from "swagger-jsdoc";

  // ─── SDK middleware types ─────────────────────────────────────────────────

  /**
   * Callback passed to every sdk handler.
   * Call it to advance to the next handler in the chain (or to signal
   * successful validation back to sdkBuilder).
   */
  export type SdkNextFn = () => void | Promise<void>;

  /**
   * A validation handler registered via `endpoint.sdk()`.
   * Receives the payload (or build context during sdkBuilder compilation) as
   * the first argument, and `next` as the second.
   *
   * Call `next()` when validation passes; throw or return without calling
   * `next()` to halt the chain.
   *
   * The same handler runs in two contexts:
   *  • Build time — sdkBuilder calls it with a `SdkBuildContext` object so
   *    you can validate route configuration during compilation.
   *  • Client side — the serialised handler is embedded in the generated SDK
   *    bundle and called with the actual request payload before `_request()`.
   *
   * @example
   * route.post("/items", "ItemController@create").sdk(async (params, next) => {
   *   if (!params?.name) throw { status: 422, message: "name is required" };
   *   await next();
   * });
   */
  export type SdkMiddlewareFn = (
    params: unknown,
    next: SdkNextFn
  ) => void | Promise<void>;

  // ─── Router types ─────────────────────────────────────────────────────────

  export type RouterMethods =
    | "get"
    | "post"
    | "options"
    | "patch"
    | "put"
    | "search"
    | "delete";

  export type docParamTypes = "path" | "query" | "body" | "header" | "cookie";

  export type PathItem = {
    $ref?: string | undefined;
    summary?: string | undefined;
    description?: string | undefined;
    get?: Operation | undefined;
    put?: Operation | undefined;
    post?: Operation | undefined;
    delete?: Operation | undefined;
    options?: Operation | undefined;
    head?: Operation | undefined;
    patch?: Operation | undefined;
    trace?: Operation | undefined;
    servers?: readonly swaggerJsDoc.Server[] | undefined;
    parameters?: Parameter[] | Reference[] | undefined;
    [key: string]: any;
  };
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

  export type paramType = {
    /** @paramType.name
     * name of the parameter
     */
    name: string;

    /** @paramType.in
     * where the parameter is located
     * e.g. : "path", "query", "body", "header", "cookie"
     * @see docParamTypes
     */
    in: docParamTypes;

    /** @paramType.type
     * type of the parameter
     * e.g. : "string", "number", "boolean", etc.
     */
    schema: {
      type: string;
    };

    /** @paramType.required
     * if the parameter is required or not
     */
    required?: boolean;

    /** @paramType.description
     * a short description of the parameter
     */
    description?: string;

    /** @paramType.allowReserved
     * if the parameter is allowed to be reserved
     * e.g. : "true", "false"
     */
    allowReserved?: boolean;
  };

  export type RouteEndpointPropertyOptions = {
    spec?: PathItem;
    /** @RouteEndpointPropertyOptions.summary
     * a short description of the endpoint.
     */
    summary?: string;
    /** @RouteEndpointPropertyOptions.tags
     * tags can be used to group endpoints
     * in the documentation.
     */
    tags?: string[];

    /** @RouteEndpointPropertyOptions.parameters
     * parameters can be used to document
     * the endpoint's parameters.
     */
    parameters?: paramType[];
  };

  export type RouteEndpointProperty = {
    method: string;
    controller: string | Function;
    endpoint: string;
    options: RouteEndpointPropertyOptions;
  };

  export type RouterMountable = {
    name?: string;
    props?: any[];
    exec: RouterMountableInterface;
  };

  export type RouterSpec = {
    /** @RouterSpec.config
     * spec config
     */
    config: {
      enabled: boolean;
      url: string;
      jsonFile: string;
    };
    /** RouterSpec.spec
     * api specs options
     */
    spec: swaggerJsDoc.Options;
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

    /** *database
     * database connection name
     * that will be used in the router
     * if not specified, it will use the default
     * database connection.
     */
    database?: string;

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

    spec: RouterSpec;

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

    /**
     * sdk() handlers applied to every route in this router.
     * Handlers are prepended before group and route-level sdk() handlers and
     * are serialised into the generated SDK bundle by sdkBuilder.
     * Accepts a single handler or an array.
     */
    sdk?: SdkMiddlewareFn | SdkMiddlewareFn[];
  };

  export type RouteGroupProperty = {
    /** RouteGroup Middleware
     * middlewares listed under this group
     * will be implemented across the group endpoints
     */
    middleware?: string[];

    /**
     * sdk() handlers applied to every route inside this group.
     * Handlers are prepended before route-level sdk() handlers and are
     * serialised into the generated SDK bundle by sdkBuilder.
     * Accepts a single handler or an array.
     */
    sdk?: SdkMiddlewareFn | SdkMiddlewareFn[];

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

    spec?: PathItem;

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
