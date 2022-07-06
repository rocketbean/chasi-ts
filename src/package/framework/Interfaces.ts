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

export type RouterConfigInterface = {
  name: string;
  prefix: string;
  namespace: string;
  middleware: string | string[];
  ControllerDir: string | string[];
  AuthRouteExceptions: string | string[];
};

export type RouteProperty = {
  method: string;
  controller: string;
  endpoint: string;
  options: any;
};
