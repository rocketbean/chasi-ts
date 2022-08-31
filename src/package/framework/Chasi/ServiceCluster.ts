import { Iobject } from "../Interfaces.js";
import Session from "./Session.js";
import cluster from "cluster";
import Storage from "./Storage.js";
import { exit } from "process";
import { PassThrough } from "stream";

export default class ServiceCluster {
  static nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

  public config: Iobject;
  public storage: Storage;
  public pids: any[] = [];
  public ids: any[] = [];
  public workers: any[] = [];
  constructor(public $session: Session) {
    this.$session = $session;
    this.config = $session.config.server.serviceCluster;
  }

  get ClusterData() {
    return {
      threads: this.config.workers,
      pids: this.pids,
      ids: this.ids,
      process: process.pid,
      scheduling: this.config.schedulingPolicy,
    };
  }
  getMethods = (obj) =>
    Object.getOwnPropertyNames(obj).filter((item) => typeof obj[item]);

  get ClusterPerf() {
    return {
      cpuAvg: process.cpuUsage(),
      mem: process.memoryUsage(),
    };
  }

  /**
   * creating general purpose
   * app SessionStorage.
   * pointed to the lead
   * thread. as only one of the
   * threads app instance will be logged
   * except for [exceptions] and [logs]
   */
  async createStorage() {
    this.storage = new Storage(this.config);
    return;
  }

  /**
   * writing cluster data
   * after specifying the lead
   * thread.
   */
  setPrimeSession(process: string | number, pids?: string[]) {
    let threads = Object.keys(cluster.workers).length;
  }

  /**
   * configure primary thread
   * assign SchedulingPolicy
   * assign settings from
   * './config/server:[serviceCluster][settings]'
   */
  setupPrimaryThread() {
    cluster.schedulingPolicy =
      this.config.schedulingPolicy == 1 ? cluster.SCHED_NONE : cluster.SCHED_RR;
    if (Session.nodeVer < 16) {
      cluster.setupMaster({
        ...this.config.settings,
        silent: true,
        stdio: [null, "inherit", null, "pipe", "pipe", "ipc"],
      });
    } else {
      cluster.setupPrimary({
        ...this.config.settings,
        silent: true,
        stdio: [null, "inherit", null, "pipe", "pipe", "ipc"],
      });
    }
  }

  setMessagingProto(worker) {
    let tunnel = new PassThrough();
    tunnel.on("data", (chunk) => {
      let _prop = JSON.parse(chunk);
      if (_prop.action.includes("getTty")) {
        let { columns, rows } = process.stdout;
        worker.process.stdio[4].write(
          JSON.stringify({
            action: _prop.action,
            transmit: { columns, rows },
          }),
        );
      }

      if (_prop.action.includes("getClusterData")) {
        worker.process.stdio[4].write(
          JSON.stringify({
            action: _prop.action,
            transmit: this.ClusterData,
          }),
        );
      }

      if (_prop.action.includes("clearAll")) {
        console.clear();
      }
    });
    worker.process.stdio[3].pipe(tunnel);
  }

  /**
   * cluster forking process
   * invokes after configuring
   * cluster settings
   */
  async createCluster() {
    return new Promise((res, rej): void => {
      this.setupPrimaryThread();
      for (let worker = 0; worker < this.config.workers; worker++) {
        process.env["lead"] = "0";
        if (worker === 0) process.env["lead"] = "1";
        let w = cluster.fork({
          env: { ...process.env },
          FORCE_COLOR: 3,
        });
        this.workers.push(w);
        this.pids.push(`${w.process.pid}`);
        this.ids.push(`${w.id}`);
      }

      cluster.on("fork", (worker: Iobject) => {
        worker.process.stderr.pipe(process.stderr);
        this.setMessagingProto(worker);

        if (worker.id == 1) {
          worker.process.stdout = process.stdout;
        }
      });

      cluster.on("exit", (worker, code, sig) => {
        cluster.fork();
      });

      cluster.on("message", (worker, m) => {});

      res(1);
    });
  }
}
