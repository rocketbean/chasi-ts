import path from "path";
import Writer from "./writers/FileWriter.js";
import {
  SessionStorageData,
  SessionStorageClusterData,
  Iobject,
} from "../Interfaces.js";
import { watch, createReadStream, readFileSync } from "fs";
import cluster from "cluster";

export default class SessionStorage {
  public data: SessionStorageData = {
    database: [],
    routeRegistry: [],
    boot: [],
    exceptions: [],
    services: [],
    logs: [],
  };

  public clusterData: SessionStorageClusterData = {
    session_id: 0,
    process: 0,
  };

  public serverFilePath;
  public clusterFilePath;
  public writer: Writer;
  public clusterWriter: Writer;
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
    this.reader = watch(
      path.join(this.serverFilePath),
      this.readServerFile.bind(this),
    );
  }

  writeClusterData(data) {
    this.clusterWriter.writeObject(data);
  }

  /**
   *
   * @returns
   */
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
          console.clear();
          this.data[target].push(message);
          this.writer.write(this.data);
        }
      }
    } else {
      this.data[target].push(message);
      this.writer.write(this.data);
    }
  }

  readServerFile(cur, prev) {
    console.clear();
    let content = readFileSync(this.serverFilePath, { encoding: "utf-8" });
    process.stdout.write(`\r ${content.toString()}\n`);
  }
}
