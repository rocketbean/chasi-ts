import {
  SessionStorageData,
  SessionStorageClusterData,
  Iobject,
} from "../Interfaces.js";
import readline from "readline";
import chalk from "chalk";
import PipeHandler from "./PipeHandler.js";

export default class SessionStorage {
  public data: SessionStorageData = {
    threads: [],
    reports: {},
    database: [],
    routeRegistry: [],
    services: [],
    boot: [],
    exceptions: [],
    logs: [],
  };

  public strData: string = "";

  public clusterData: Iobject = {};

  public enabled;

  public pipe: PipeHandler;

  public ReportLog: any = Logger.writers["Reporter"];

  constructor(public config: Iobject) {
    if (process.env.lead === "1") {
      if (this.config.trackUsage.enabled) {
        let cb = this.reportPerf.bind(this);
        setInterval(cb, this.config.trackUsage.interval);
      }
    }
  }

  async setPipe(pipe) {
    this.pipe = pipe;
    this.pipe.on("getClusterData", (d) => {
      this.clusterData = d;
      if (this.config.logs) this.appendClusterData();
    });
    await this.pipe.write({ action: "getClusterData" });
  }

  reportPerf() {
    readline.clearScreenDown(process.stdout);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    this.data.reports = this.requestPerf();
    process.stdout.write(this.format(this.data));
  }

  requestPerf() {
    let rss = Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;
    let used =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
    let total =
      Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100;

    let log = this.ReportLog.customFormat("", {
      rss,
      used,
      total,
    });
    return {
      memory: log,
    };
  }

  appendClusterData() {
    let sched =
      this.clusterData.scheduling == 1 ? "[1]os specified" : "[2]RoundRobin";
    this.data.threads.push(
      chalk.bold.magentaBright(`Active thread/s : `) +
        `[${this.clusterData.threads}]\n`,
      chalk.bold.magentaBright(`Scheduling      : `) + sched + "\n",
      chalk.bold.magentaBright(`MainThread      : `) +
        this.clusterData.process +
        "\n",
      chalk.bold.magentaBright(`Lead            : `) + process.pid + "\n",
      chalk.bold.magentaBright(`PIDs            : `) +
        this.clusterData?.pids?.join(" ") +
        "\n",
    );
  }

  format(data: any) {
    console.clear();
    let str = "\r \r ";
    Object.keys(data).forEach((group) => {
      if (Array.isArray(data[group])) {
        if (data[group].length > 0) {
          str += chalk.dim.bold.bgRgb(15, 100, 204).rgb(0, 0, 24)(
            `\n • ${group.toUpperCase()} \n`,
          );
          str += "\n";
          str += data[group].map((message) => `  ${message}`).join("");
        }
      } else {
        if (Object.keys(data[group]).length > 0) {
          str += chalk.dim.bold.bgRgb(15, 100, 204).rgb(0, 0, 24)(
            `\n • ${group.toUpperCase()} \n`,
          );
          str += "\n";
          Object.keys(data[group]).map((k) => {
            str += ` ${data[group][k]}\n`;
          });
        }
      }
    });
    str += "\n";

    return str;
  }

  write(message: any, target: string = "logs") {
    if (this.config.enabled) {
      if (process.env.lead == "1") {
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearLine(process.stdout, -1);
        this.data[target].push(message);
        process.stdout.write(this.format(this.data));
      }
    } else {
      this.data[target].push(message);
      process.stdout.write(this.format(this.data));
    }
  }
}
