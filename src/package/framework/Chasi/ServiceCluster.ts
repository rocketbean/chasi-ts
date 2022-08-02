import { Iobject } from "../Interfaces.js";
import { watch, createReadStream } from "fs";
import path from "path";
import Session from "./Session.js";
import cluster from "cluster";
import Writer from "./writers/FileWriter.js";
import Storage from "./Storage.js";
import SessionStorage from "./Storage.js";
export default class ServiceCluster {
  public config: Iobject;
  public storage: Storage;
  public reader;
  constructor(public $session: Session) {
    this.$session = $session;
    this.config = $session.config.server.serviceCluster;
    this.createStorage();
  }

  createStorage() {
    this.storage = new Storage(
      this.config.serverFile,
      this.config.clusterFile,
      this.config,
    );
  }

  setPrimeSession(process: string | number) {
    this.storage.writeClusterData({ session_id: 0, process });
  }

  async createCluster() {
    return new Promise((res, rej): void => {
      for (let worker = 0; worker < this.config.workers; worker++) {
        let w = cluster.fork();
        if (worker === this.config.workers - 1) {
          this.setPrimeSession(w.process.pid);
        }
      }

      cluster.on("exit", (worker, code, sig) => {
        cluster.fork({ silent: true });
      });

      cluster.on("fork", (worker) => {
        this.storage.watcher();
        let prime = Math.max(
          ...Object.keys(cluster.workers).map((w) => Number(w)),
        );

        if (prime == worker.id) {
          this.setPrimeSession(worker.process.pid);
          console.log(SessionStorage.readClusterData(), "@cluster data");
        }
      });

      cluster.on("message", (d) => {
        console.log(d, "@messsage from cluster worker thread");
      });

      res(1);
    });
  }
}
