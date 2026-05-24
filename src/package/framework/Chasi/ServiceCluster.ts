import { Iobject, serviceClusterConfig } from "../Interfaces.js";
import Session from "./Session.js";
import cluster, { Worker as ClusterWorker } from "cluster";
import Storage from "./Storage.js";
import Pipeline from "./Pipeline.js"
import StreamBucket from "./StreamBucket.js";
export type ServicePipeProp = {
  service: string;
  action: string;
  transmit: unknown;
}

export default class ServiceCluster {
  static nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

  public config: serviceClusterConfig;
  public storage: Storage;
  public pids: string[] = [];
  public ids: string[] = [];
  public workers: ClusterWorker[] = [];
  private forkOpts: { env: NodeJS.ProcessEnv; FORCE_COLOR: number } = {
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

  getMethods = (obj: object): string[] =>
    Object.getOwnPropertyNames(obj).filter((item) => typeof (obj as Record<string, unknown>)[item] === "function");

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
  setPrimeSession(process: string | number, pids?: string[]): void {
    const threads = Object.keys(cluster.workers ?? {}).length;
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

  async broadcast(message: string): Promise<void> {
    await Promise.all(this.workers.map(async (worker: ClusterWorker) => {
      await (worker.process.stdio[4] as NodeJS.WritableStream).write(message);
    }));
  }

  async setMessagingProto(worker: ClusterWorker): Promise<void> {
    const pl = new Pipeline();
    const streamBucket: StreamBucket = new StreamBucket(worker, this.consumeStream.bind(this));
    pl.on("data", (chunk: Buffer) => {
      streamBucket.appendStreamData(chunk.toString());
    });
    (worker.process.stdio[3] as NodeJS.ReadableStream).pipe(pl);
  }

  async consumeStream(worker: ClusterWorker, chunk: string): Promise<string | void> {
    try {
      const _prop: Record<string, unknown> = JSON.parse(chunk);
      const action = _prop.action as string;

      if (action.includes("getTty")) {
        const { columns, rows } = process.stdout;
        (worker.process.stdio[4] as NodeJS.WritableStream).write(
          JSON.stringify({ action, transmit: { columns, rows } }),
        );
      }

      if (cluster.isPrimary) {
        if (action.includes("getClusterData")) {
          this.storage.setClusterData(this.ClusterData);
        }
        if (action.includes("logData")) {
          const transmit = _prop.transmit as Record<string, unknown>;
          Logger.clusterLog(_prop.worker as { pid: number; id: number }, transmit.message);
        }
        if (action.includes("server::ready")) {
          Logger.clusterLogSystem(_prop.worker as { pid: number; id: number }, `[Server {${(_prop.worker as Record<string, unknown>).pid}} onReady state]`);
        }
      }

      if (action.includes("service:")) {
        await this.handleServiceActions(worker, _prop as unknown as ServicePipeProp);
      }
      if (action.includes("websock")) {
        await this.handleSocketActions(worker, _prop);
      }
      if (action.includes("clearAll")) {
        console.clear();
      }

      return chunk;
    } catch (e: unknown) {
      Logger.log("SERVCLUSTERR::", e);
    }
  }

  async handleServiceActions(worker: ClusterWorker, _prop: ServicePipeProp): Promise<void> {
    setTimeout(async () => {
      await this.broadcast(
        JSON.stringify({
          service: _prop.service,
          action: `service:${_prop.service}`,
          transmit: _prop,
        }),
      );
    }, 20);
  }

  async handleSocketActions(worker: ClusterWorker, _prop: Record<string, unknown>): Promise<void> {
    const action = _prop.action as string;
    if (action.includes("event")) {
      await this.broadcast(JSON.stringify({ action: "socket:fire", transmit: _prop }));
    } else {
      await this.broadcast(JSON.stringify({ action, transmit: _prop }));
    }
  }

  /**
   * cluster forking process
   * invokes after configuring
   * cluster settings
   */
  async createCluster(): Promise<number> {
    return new Promise<number>((res, rej) => {
      try {
        this.setupPrimaryThread();
        for (let i = 0; i < this.config.workers; i++) {
          process.env["lead"] = "0";
          if (i === 0) process.env["lead"] = "1";
          cluster.fork(this.forkOpts);
        }

        cluster.on("fork", (worker: ClusterWorker) => {
          (worker.process.stderr as NodeJS.ReadableStream).pipe(process.stderr);
          this.setMessagingProto(worker);
          this.workers.push(worker);
          this.pids.push(`${worker.process.pid}`);
          this.ids.push(`${worker.id}`);
        });
        cluster.on("exit", () => {
          cluster.fork(this.forkOpts);
        });
        cluster.on("message", (_worker: ClusterWorker, _m: unknown) => {});
        res(1);
      } catch (e: unknown) {
        console.log(e);
        rej(e);
        process.exit(1);
      }
    });
  }
}
