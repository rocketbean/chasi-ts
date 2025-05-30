import DB, { DBProperty } from "Chasi/Database";
import chalk from "chalk";
export default class Driver {
  public hasOptions = false;
  public $property: Partial<DB.DBProperty<DB.drivers, any>> = {};
  public protocol: string;

  $log: { [key: string]: any } = {
    center: Logger.writer("Center"),
    left: Logger.writer("Left"),
    right: Logger.writer("Right"),
    endTrace: Logger.writer("EndTrace"),
    startTrace: Logger.writer("StartTrace"),
    RouterList: Logger.writer("RouterList"),
  };

  public states: any[] = [
    chalk.redBright,
    chalk.greenBright,
    chalk.yellowBright,
    chalk.whiteBright,
  ];

  constructor(public config: DBProperty<DB.drivers, any>) {
    this.config = config;
  }
}
