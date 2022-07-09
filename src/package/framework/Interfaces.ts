let _checkout = checkout;

export interface ModuleInterface {}

export interface Iobject {
  [key: string]: any;
}

export interface genericObject {
  [key: string]: any;
}

export interface RoutableInterface {}

export interface ServiceProviderInterface {
  boot(a?: any, b?: any): void;
}

export interface BootableInterface {
  boot(a?: any, b?: any): void;
}

export interface RouteMethodsInterface {}

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

export type RouteProperty = {
  method: string;
  controller: string;
  endpoint: string;
  options: any;
};

export type RouteGroupProperty = {
  middleware: string | string[];
  prefix?: string;
  before?: Function;
  after?: Function;
};
