import { DBDriverInterface } from "./Database/drivers/drivers.js";
export * from "./Router/Router.types.js"
export * from "./Server/Server.types.js"

export interface AuthDriver {
  property: Iobject;
  authorize: Function;
}
export interface ModuleInterface {}

export interface Constructuble<T> {
  new <T>(a?: any, B?: any): T;
}

export interface Iobject {
  [key: string]: any;
}

export interface DatabaseDrivers {
  [key: string]: DBDriverInterface;
}

export interface genericObject {
  [key: string]: any;
}

export interface AppException {}

export interface RoutableInterface {}

export interface ProviderInterface {
  name: string;
  instance: any;
  service: any;
  status: string;
}

export interface ServiceProviderInterface {
  boot(a?: any, b?: any): void;
  ServerBoot?(a?: any, b?: any): void;
}

export interface BootableInterface {
  boot(a?: any, b?: any): void;
}

export interface RouteMethodsInterface {}
export interface ModelInterface {}

export interface ExceptionLoggerInterface {
  write(a?: any, b?: any);
}


export type SessionStorageData = {
  threads: any;
  database: Iobject[];
  routeRegistry: Iobject[];
  boot: Iobject[];
  services: [];
  exceptions: any;
  reports: any;
  logs: any;
};

export type SessionStorageClusterData = {
  process: number | string;
  session_id: number | string;
  threads: any;
  pids: any;
  scheduling: number;
  serverData: Iobject;
};


export type DBProperty = {
  driver: string;
  url: string;
  db: string;
  params?: string;
  options?: any;
  hideLogConnectionStrings?: boolean;
};

export type DatabaseConfig = {
  /**
   * Connection name
   * declared in 
   * [DatabaseConfig.connections]
   */
  host: string;

  /**
   * will throw an
   * execution error 
   * if one of the DB connections
   * failed to connect
   */
  bootWithDB: boolean;

  /**
   * the default connection
   * to be used by the models
   * if none is specified
   */
  default: string;

  /**
   * hides the connection 
   * string in terminal
   * logging
   */
  hideLogConnectionStrings: boolean;

  /**
   * this is where database connections 
   * should be declared.
   */
  connections: { [key: string]: DBProperty };
};

export type RouteEndpointProperty = {
  method: string;
  controller: string | Function;
  endpoint: string;
  options: any;
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
  before?: Function;

  /** RouteGroup after event
   * after() will be emitted before
   * sending a response object 
   * to the client
   */
  after?: Function;
};

export type ExceptionProperty = {
  name?: string;
  message?: string;
  interpose?: number | string;
  showStack?: boolean;
  stack?: any;
};

export type genericImport = {
  [key: string]: any;
  default: Function;
};
