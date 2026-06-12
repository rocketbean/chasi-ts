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
  private leadWorkerId: number | null = null;
  // cluster.fork(env) expects a flat key/value object — nesting an "env" key
  // inside it would stringify to "[object Object]" in the worker's process.env.
  private forkOpts: Record<string, string> = {
    FORCE_COLOR: "3",
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
          const worker  = _prop.worker as { pid: number; id: number };
          const target  = (transmit.target as string) || "logs";
          const msg     = String(transmit.message);
          // Structured sections (boot, database, routeRegistry, services…) already
          // carry visual formatting baked in — prepending a raw text prefix breaks
          // their padding. Only tag exceptions so the originating worker is clear.
          const entry = target === "exceptions" ? `[w${worker.id}:${worker.pid}] ${msg}` : msg;
          this.storage.write(entry, target);
        }
        if (action.includes("server::ready")) {
          const worker = _prop.worker as Record<string, unknown>;
          this.storage.write(`Worker ${worker.id}  pid ${worker.pid}  ready\n`, "workers");
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
      this.storage.write(`[consumeStream] ${String(e)}`, "exceptions");
    }
  }

  async handleServiceActions(worker: ClusterWorker, _prop: ServicePipeProp): Promise<void> {
    setTimeout(async () => {
      try {
        await this.broadcast(
          JSON.stringify({
            service: _prop.service,
            action: `service:${_prop.service}`,
            transmit: _prop,
          }),
        );
      } catch (e: unknown) {
        this.storage.write(`[handleServiceActions] ${String(e)}`, "exceptions");
      }
    }, 20);
  }

  async handleSocketActions(worker: ClusterWorker, _prop: Record<string, unknown>): Promise<void> {
    try {
      const action = _prop.action as string;
      if (action.includes("event")) {
        // Exclude the originating worker — it already fired the event locally.
        // Broadcasting back to it would cause every event handler to run twice.
        const others = this.workers.filter((w) => w.id !== worker.id);
        await Promise.all(
          others.map((w) =>
            (w.process.stdio[4] as NodeJS.WritableStream).write(
              JSON.stringify({ action: "socket:fire", transmit: _prop })
            )
          )
        );
      } else {
        await this.broadcast(JSON.stringify({ action, transmit: _prop }));
      }
    } catch (e: unknown) {
      this.storage.write(`[handleSocketActions] ${String(e)}`, "exceptions");
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
        // Set TERM_COLS on the primary's process.env so every forked worker
        // inherits the correct terminal width (workers have no TTY themselves).
        process.env.TERM_COLS = String(process.stdout.columns || 100);
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
          // First worker forked becomes the lead.
          if (this.leadWorkerId === null) this.leadWorkerId = worker.id;
        });
        cluster.on("exit", (deadWorker: ClusterWorker) => {
          this.workers = this.workers.filter((w) => w.id !== deadWorker.id);
          this.pids = this.pids.filter((p) => p !== `${deadWorker.process.pid}`);
          this.ids = this.ids.filter((id) => id !== `${deadWorker.id}`);
          // Restore the correct lead flag before re-forking so the replacement
          // worker inherits the same role as the one that crashed.
          process.env["lead"] = deadWorker.id === this.leadWorkerId ? "1" : "0";
          const newWorker = cluster.fork(this.forkOpts);
          if (deadWorker.id === this.leadWorkerId) this.leadWorkerId = newWorker.id;
        });

        const shutdown = () => {
          for (const worker of this.workers) worker.disconnect();
          this.storage.destroy();
          setTimeout(() => process.exit(0), 5000).unref();
        };
        process.once("SIGTERM", shutdown);
        process.once("SIGINT", shutdown);
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
