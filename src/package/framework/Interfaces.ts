let _checkout = checkout;

export interface ModuleInterface {}
export interface Constructuble<T> {
  new <T>(a?: any, B?: any): T;
}

export interface Iobject {
  [key: string]: any;
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

export type serverConfig = {
  staticDir: any;
  port: any;
  environment: any;
  modes: { [key: string]: any };
};

export type RouterConfigInterface = {
  name: string;
  prefix: string;
  namespace: string;
  middleware: string | string[];
  ControllerDir: string | string[];
  AuthRouteExceptions?: string | string[];
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
  middleware: string | string[];
  controller?: string;
  prefix?: string;
  before?: Function;
  after?: Function;
};

export type ExceptionProperty = {
  name?: string;
  message?: string;
};

export type genericImport = {
  [key: string]: any;
  default: Function;
};
