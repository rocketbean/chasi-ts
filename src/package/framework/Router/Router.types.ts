import { Iobject } from "../Interfaces.js";
import Router from "./Router.js"

export type RouterMethods = "get" | "post" | "options" | "patch" | "put" | "search" | "delete";

export type RouteExceptions = {
  /** @RouteExceptions.url
   * string path of the targeted endpoint
   */
  url: string,
  
  /** @RouteExceptions.m
   * RouterMethods
   * e.g. Post, Get, etc.
   */
  m: RouterMethods
}

export interface RouterMountableInterface {
  mount(router: Router, a: any);
}

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
   * this file directory
   * is where endpoints will be registered
   * this file must contain a function
   * that will accept [route] as
   * parameter
   */
  namespace: string;

  /** *middleware
   * this list of middleware will be applied to
   * all of the routes registered at
   * this namespace
   */
  middleware: string | string[];

  /** *ControllerDir
   * directories registered
   * here will be overlooked by
   * Chasi App instance.
   */
  ControllerDir: string | string[];

  /** ?AuthRouteExceptions
   * if there's an instance where
   * you will have route/s that needs to
   * be excempted from Authentication Guards
   * you can register those endpoint here.
   * and please note that unauthorized guard
   * will not be able to access params like
   * [request.auth]
   */
  AuthRouteExceptions?: RouteExceptions[];

  /** ?data
   * @data [Router Hook] 
   * declared data inside this hook
   * will be avilable throughout 
   * this Router[Instance]
   */
  data?: () => Iobject;

  /** ?mount
   * [CompilerEngine]
   * after enabling CompilerEngine module,
   * Engine instance can be mounted
   * in this router by registering
   * Engine here.
   * ref: https://vitejs.dev/
   */
  mount?: RouterMountable[];
  /** ?before
   * @before [Router LifeCycle Hook] 
   * this function will be invoke 
   * before a request is passed
   * into controller.
   */
  before?: Function;

  /** ?after
   * @after [Router LifeCycle Hook] 
   * this function will be invoke 
   * before a response 
   * is sent back.
   */
  after?: Function;

  /** ?displayLog
   * @displayLog 
   * [0] to disable router logs
   * [1] to enable router logs
   */
  displayLog?: 0 | 1;
};
