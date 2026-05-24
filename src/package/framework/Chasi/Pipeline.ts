import { Duplex } from "stream";
import cluster from "cluster";

export default class PipeLine extends Duplex {
  dockType: "main" | "worker";

  constructor() {
    super();
    this.dockType = cluster.isPrimary ? "main" : "worker";
  }

  _read(_size: number): void {}

  _write(chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    const canContinue = this.push(chunk);
    if (!canContinue) {
      this.once("drain", callback);
    } else {
      callback();
    }
  }

  _final(callback: (error?: Error) => void): void {
    callback();
  }
}
