import path from "path";
import Writer from "./writers/FileWriter.js";
import {
  SessionStorageData,
  SessionStorageClusterData,
  Iobject,
} from "../Interfaces.js";
import { watch, createReadStream, readFileSync } from "fs";
import chalk from "chalk";
import fs, { constants } from "fs";

export default class SessionStorage {
  public data: SessionStorageData = {
    threads: [],
    database: [],
    routeRegistry: [],
    services: [],
    boot: [],
    exceptions: [],
    logs: [],
  };

  public clusterData: SessionStorageClusterData = {
    session_id: 0,
    process: 0,
    threads: [],
    pids: [],
    scheduling: 2,
    serverData: {},
  };

  public clusterFilePath;
  public clusterWriter: Writer;
  public clusterReader;
  public serverFilePath;
  public writer: Writer;
  public reader;
  public enabled;
  public static clusterData;

  constructor(
    private sessionPath: string,
    private clusterPath: string,
    public config: Iobject,
  ) {
    this.writer = new Writer(sessionPath);
    this.clusterWriter = new Writer(clusterPath);
    this.serverFilePath = path.join(__dirname, sessionPath);
    this.clusterFilePath = path.join(__dirname, clusterPath);
    this.config = config;
    SessionStorage.clusterData = this.clusterFilePath;
    this.watcher();
  }

  public watcher() {
    let clusterData = SessionStorage.readClusterData();
    if (!this.config.enabled || clusterData.process == process.pid) {
      if (this.config.logs && this.config.enabled) this.watchThreads();
      this.reader = watch(
        path.join(this.serverFilePath),
        this.readServerFile.bind(this),
      );
      this.clusterReader = watch(
        path.join(this.clusterFilePath),
        this.readClusterFile.bind(this),
      );
    }
  }

  /****
   * Verify existence of a file
   * and directory
   */
  static async verifyExistingDir(filepaths: string[]) {
    return await Promise.all(
      filepaths.map(async (filepath) => {
        filepath = path.join(__dirname, filepath);
        await fs.promises
          .access(filepath, constants.R_OK)
          .catch(async (err) => {
            console.log(filepath, "@@ filepath");
            if (err) {
              return await fs.writeFile(filepath, "", (writeErr) => {
                if (writeErr) return writeErr;
                else return filepath;
              });
            }
          });
      }),
    );
  }

  saveServerData() {
    let clusterData = SessionStorage.readClusterData();
    this.clusterData = clusterData;
    this.clusterData.serverData = this.data;
    this.writeClusterData(this.clusterData);
  }

  watchThreads() {
    let clusterData = SessionStorage.readClusterData();
    let sched = clusterData.scheduling == 1 ? "os specified" : "RoundRobin";
    this.data.threads.push(
      chalk.bold.magentaBright(`Active thread/s : `) +
        `[${clusterData.threads}]\n`,
      chalk.bold.magentaBright(`Scheduling      : `) + sched + "\n",
      chalk.bold.magentaBright(`MainThread      : `) +
        clusterData.process +
        "\n",
      chalk.bold.magentaBright(`PIDs            : `) +
        clusterData?.pids?.join(" ") +
        "\n",
    );
  }

  writeClusterData(data) {
    this.clusterData = data;
    this.clusterWriter.writeObject(this.clusterData);
  }

  static readClusterData() {
    try {
      let content = readFileSync(SessionStorage.clusterData, {
        encoding: "utf-8",
      }).toString();
      return JSON.parse(content);
    } catch (e) {
      return false;
    }
  }

  write(message: any, target: string = "logs") {
    let clusterData = SessionStorage.readClusterData();
    if (this.config.enabled) {
      if (clusterData) {
        if (clusterData.process == process.pid) {
          console.log("falling hir");
          this.data[target].push(message);
          this.writer.write(this.data);
        } else {
          if (target == "logs" || target == "exceptions") {
            this.appendTargetData(message, target);
          }
        }
      }
    } else {
      this.data[target].push(message);
      this.writer.write(this.data);
    }
  }

  appendTargetData(message: any, target: string = "logs") {
    let clusterData = SessionStorage.readClusterData();
    if (clusterData.serverData[target]) {
      clusterData.serverData[target].push(
        chalk.bgGray
          .rgb(147, 231, 85)
          .bold(` ☼ PID-${process.pid} | Stamp:${Date.now()} \n`) +
          `  ${message}` +
          "\n",
      );
    }
    this.writeClusterData(clusterData);
  }

  readServerFile(cur, prev) {
    console.clear();
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    let clusterData = SessionStorage.readClusterData();
    let content = readFileSync(this.serverFilePath, { encoding: "utf-8" });
    process.stdout.write(`\r ${content.toString()}\n`);
  }

  readClusterFile(cur, prev) {
    if (cur == "change") {
      let clusterData = SessionStorage.readClusterData();
      clusterData.serverData?.logs.map((log: string) => {
        if (!this.data.logs.includes(log)) {
          this.write(log);
        }
      });
      clusterData.serverData?.exceptions.map((exc: string) => {
        if (!this.data.exceptions.includes(exc)) {
          this.write(exc, "exceptions");
        }
      });
    }
  }
}
