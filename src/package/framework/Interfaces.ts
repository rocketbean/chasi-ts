import { DBDriverInterface } from "./Database/drivers/drivers.js";

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

export interface ServiceProviderInterface {
  boot(a?: any, b?: any): void;
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
  database: Iobject[];
  routeRegistry: Iobject[];
  boot: Iobject[];
  exceptions: Iobject[];
  services: [];
  logs: [];
};

export type SessionStorageClusterData = {
  process: number | string;
  session_id: number | string;
};

export type serverConfig = {
  staticDir: any;
  port: any;
  environment: any;
  modes: { [key: string]: any };
  cors: Iobject;
  serviceCluster: Iobject;
};

export type RouterConfigInterface = {
  name: string;
  auth: string | boolean | null;
  prefix: string;
  namespace: string;
  middleware: string | string[];
  ControllerDir: string | string[];
  AuthRouteExceptions?: Iobject;
  before?: Function;
  after?: Function;
};

export type DBProperty = {
  driver: string;
  url: string;
  db: string;
  params?: string;
  options?: any;
};

export type DatabaseConfig = {
  host: string;
  bootWithDB: boolean;
  default: string;
  connections: { [key: string]: DBProperty };
};

export type RouteEndpointProperty = {
  method: string;
  controller: string | Function;
  endpoint: string;
  options: any;
};

export type RouteGroupProperty = {
  middleware: any[];
  controller?: string;
  prefix?: string;
  before?: Function;
  after?: Function;
};

export type ExceptionProperty = {
  name?: string;
  message?: string;
  interpose?: number | string;
  showStack?: boolean;
};

export type genericImport = {
  [key: string]: any;
  default: Function;
};
