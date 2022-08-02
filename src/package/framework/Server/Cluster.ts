import os, { networkInterfaces } from "os";
import cluster, { Worker } from "cluster";
import { Iobject, serverConfig } from "../Interfaces.js";

export default class ServiceCluster {
  public workers: { [key: string]: Worker } = {};
  public cpus: Iobject;
  public nodeVer: number;
  constructor(public config: serverConfig, public server: any) {
    this.cpus = os.cpus();
    this.nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
    this.server = server;
    this.config = config;
    this.setupCluster();
    this.assignEventListeners();
  }

  /**
   * listening to
   * cluster events
   */
  assignEventListeners() {
    cluster.on("fork", (worker) => {
      console.log("forking cpu worker");
      this.workers[worker.process.pid] = worker;
      this.server.listen(this.config.port, () => {
        console.log("listening ::");
      });
    });

    cluster.on("exit", (worker, code, sig) => {
      console.log("service worker died::", worker.process.pid);
      delete this.workers[worker.process.pid];
      cluster.fork();
    });
  }

  /**
   * Setup primary thread
   */
  setupCluster() {
    if (this.nodeVer < 16) {
      cluster.setupMaster({
        silent: true,
      });
    } else {
      cluster.setupPrimary({
        silent: true,
      });
    }
  }

  /***
   * creating clusters
   * for PID serviceWorkers
   */
  async createCluster(): Promise<void> {
    if (this.checkMainThread()) {
      for (let cpu in os.cpus()) {
        cluster.fork();
      }
    }
  }

  /**
   * checking [node version]
   * to return [isMaster]
   * || [isPrimary] property
   **/
  checkMainThread(): Function | boolean {
    if (this.nodeVer < 16) return cluster.isMaster;
    else return cluster.isPrimary;
  }
}
