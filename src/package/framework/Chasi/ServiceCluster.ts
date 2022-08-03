import { Iobject } from "../Interfaces.js";
import { watch, createReadStream } from "fs";
import path from "path";
import Session from "./Session.js";
import cluster from "cluster";
import Writer from "./writers/FileWriter.js";
import Storage from "./Storage.js";
import SessionStorage from "./Storage.js";
export default class ServiceCluster {
  static nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

  public config: Iobject;
  public storage: Storage;
  public reader;
  constructor(public $session: Session) {
    this.$session = $session;
    this.config = $session.config.server.serviceCluster;
    this.createStorage();
  }

  /**
   * creating general purpose
   * app SessionStorage.
   * pointed to the lead
   * thread. as only one of the
   * threads app instance will be logged
   * except for [exceptions] and [logs]
   */
  createStorage() {
    this.storage = new Storage(
      this.config.serverFile,
      this.config.clusterFile,
      this.config,
    );
  }

  /**
   * writing cluster data
   * after specifying the lead
   * thread.
   */
  setPrimeSession(process: string | number, pids?: string[]) {
    let threads = Object.keys(cluster.workers).length;
    this.storage.writeClusterData({
      session_id: 0,
      process,
      threads,
      pids,
      scheduling: this.config.schedulingPolicy,
      serverData: {},
    });
  }

  /**
   * configure primary thread
   * assign SchedulingPolicy
   * assign settings from
   * './config/server:[serviceCluster][settings]'
   */
  setupPrimaryThread() {
    cluster.schedulingPolicy = this.config.schedulingPolicy;
    if (Session.nodeVer < 16) {
      cluster.setupMaster(this.config.settings);
    } else {
      cluster.setupPrimary(this.config.settings);
    }
  }

  /**
   * cluster forking process
   * invokes after configuring
   * cluster settings
   */
  async createCluster() {
    return new Promise((res, rej): void => {
      this.setupPrimaryThread();
      let pids: string[] = [];
      let ids: string[] = [];
      for (let worker = 0; worker < this.config.workers; worker++) {
        let w = cluster.fork();
        pids.push(`${w.process.pid}`);
        ids.push(`${w.id}`);
        if (worker === this.config.workers - 1) {
          this.setPrimeSession(w.process.pid, pids);
        }
      }

      cluster.on("exit", (worker, code, sig) => {
        cluster.fork();
      });

      cluster.on("message", (worker, m) => {});

      cluster.on("fork", (worker: Iobject) => {
        let len = Object.keys(cluster.workers).length;
        if (len == worker.id) {
          this.setPrimeSession(worker.process.pid, pids);
        }
      });

      res(1);
    });
  }
}
