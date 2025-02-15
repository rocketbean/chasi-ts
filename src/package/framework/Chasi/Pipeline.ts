import { Duplex } from "stream";
import cluster from "cluster";
export default class PipeLine extends Duplex {
  dockType: "main" | "worker"
  constructor() {
    super()
    this.dockType = cluster.isPrimary ? "main" : "worker"
  }

  _read(chunk): void {

  }

  _write(chunk, encoding, callback) {
    let r = this.push(chunk)
    if (!r) {
      console.log("full")
    }
    callback()
  }

  _final(callback: (error?: Error) => void): void {
    callback()
  }

}