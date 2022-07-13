import { DBProperty } from "../../Interfaces.js";

export default class Driver {
  $log: { [key: string]: any } = {
    center: Logger.writer("Center"),
    left: Logger.writer("Left"),
    right: Logger.writer("Right"),
    endTrace: Logger.writer("EndTrace"),
    startTrace: Logger.writer("StartTrace"),
    RouterList: Logger.writer("RouterList"),
  };

  constructor(public config: DBProperty) {
    this.config = config;
  }
}

export interface DBDriverInterface {
  config: DBProperty;
  connection: any;
  isDefaultDB: boolean;
  connect(a?: any): void;
}
