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
  host: string;
  bootWithDB: boolean;
  default: string;
  hideLogConnectionStrings: boolean;
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
  stack?: any;
};

export type genericImport = {
  [key: string]: any;
  default: Function;
};
