export * from "./Router/Router.types.js";
export * from "./Server/Server.types.js";

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
  workers?: {};
};

export type SessionStorageClusterData = {
  process: number | string;
  session_id: number | string;
  threads: any;
  pids: any;
  scheduling: number;
  serverData: Iobject;
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
