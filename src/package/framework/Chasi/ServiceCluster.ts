import { Iobject, serviceClusterConfig } from "../Interfaces.js";
import Session from "./Session.js";
import cluster from "cluster";
import Storage from "./Storage.js";
import Pipeline from "./Pipeline.js"
import StreamBucket from "./StreamBucket.js";
export type ServicePipeProp = {
  service: string
  action: string
  transmit: any
}

export default class ServiceCluster {
  static nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

  public config: serviceClusterConfig;
  public storage: Storage;
  public pids: any[] = [];
  public ids: any[] = [];
  public workers: any[] = [];
  private forkOpts: Iobject = {
    env: { ...process.env },
    FORCE_COLOR: 3,
  };

  constructor(public $session: Session) {
    this.$session = $session;
    this.config = $session.config.server.serviceCluster;
  }

  /**
   * Stores Cluster
   * information.
   */
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

  /**
   * returns process
   * performance
   */
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
        stdio: [null, null, null, "pipe", "pipe", "ipc"],
      });
    } else {
      cluster.setupPrimary({
        ...this.config.settings,
        silent: true,
        stdio: [null, null, null, "pipe", "pipe", "ipc"],
      });
    }
  }

  async broadcast(message) {
    await Promise.all(this.workers.map(async (worker) => {
      await worker.process.stdio[4].write(message);
    }));
  }

  async setMessagingProto(worker) {
    let pl = new Pipeline()
    let data = ""
    let streamBucket: StreamBucket = new StreamBucket(worker, this.consumeStream.bind(this))
    pl.on("data", (chunk) => {
      streamBucket.appendStreamData(chunk.toString())
    })

    worker.process.stdio[3].pipe(pl)
  }

  async consumeStream(worker, chunk: string) {
    try {
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

      if (cluster.isPrimary) {
        if (_prop.action.includes("getClusterData")) {
          this.storage.setClusterData(this.ClusterData)
        }

        if (_prop.action.includes("logData")) {
          Logger.clusterLog(_prop.worker, _prop.transmit.message);
        }

        if (_prop.action.includes("server::ready")) {
          Logger.clusterLogSystem(_prop.worker, `[Server {${_prop.worker.pid}} onReady state]`);
        }
      }

      if (_prop.action.includes("service:")) {
        await this.handleServiceActions(worker, _prop);
      }

      if (_prop.action.includes("websock")) {
        await this.handleSocketActions(worker, _prop);
      }

      if (_prop.action.includes("clearAll")) {
        console.clear();
      }

      return chunk;
    } catch (e) {
      Logger.log("SERVCLUSTERR::", e)
    }
  }

  /**
   * 
   * @param worker Worker
   * @param _prop any
   */
  async handleServiceActions(worker: Worker, _prop: ServicePipeProp) {
    setTimeout(async () => {
      await this.broadcast(
        JSON.stringify({
          service: _prop.service,
          action: `service:${_prop.service}`,
          transmit: _prop,
        }),
      );
    }, 20)

  }

  async handleSocketActions(worker, _prop) {
    if (_prop.action.includes("event")) {
      await this.broadcast(
        JSON.stringify({
          action: "socket:fire",
          transmit: _prop,
        }),
      );
    } else {
      await this.broadcast(
        JSON.stringify({
          action: _prop.action,
          transmit: _prop,
        }),
      );
    }
  }

  /**
   * cluster forking process
   * invokes after configuring
   * cluster settings
   */
  async createCluster() {
    return new Promise((res, rej): void => {
      try {
        this.setupPrimaryThread();
        for (let worker = 0; worker < this.config.workers; worker++) {
          process.env["lead"] = "0";
          if (worker === 0) process.env["lead"] = "1";
          let w = cluster.fork(this.forkOpts);
        }

        cluster.on("fork", (worker: Iobject) => {
          worker.process.stderr.pipe(process.stderr);
          this.setMessagingProto(worker);
          this.workers.push(worker);
          this.pids.push(`${worker.process.pid}`);
          this.ids.push(`${worker.id}`);
        });
        cluster.on("exit", (worker, code, sig) => {
          cluster.fork(this.forkOpts);
        });

        cluster.on("message", (worker, m) => {
          // Logger.log("message from worker", m)
        });
        res(1);
      } catch (e) {
        console.log(e)
        process.exit(1)
      }

    });
  }
}
