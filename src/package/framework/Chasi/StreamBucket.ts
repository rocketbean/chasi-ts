import { Worker as ClusterWorker } from "cluster";
import { PIPE_DELIM } from "./PipeHandler.js";

/**
 * Reassembles framed messages arriving from a worker over its stdio pipe.
 *
 * Bytes from the pipe arrive in arbitrary fragments — a single frame can be
 * split across many chunks and several frames can land in one chunk. This
 * buffers the raw stream and emits every complete `<=====|…|=====>` frame to the
 * callback, leaving any partial tail in the buffer until the rest arrives.
 *
 * The previous implementation used a Proxy + overflow + index-rewriting scheme
 * that dropped every frame once input was fragmented or bursty, which broke all
 * cross-worker socket delivery under load.
 */
export default class StreamBucket {
  private buffer: string = "";
  // Serializes async callbacks so frames are delivered in arrival order and
  // never overlap, regardless of how the stream is chunked.
  private chain: Promise<unknown> = Promise.resolve();

  constructor(
    private worker: ClusterWorker,
    private cb: (worker: ClusterWorker, chunk: string) => Promise<unknown>,
  ) {}

  appendStreamData(streamdata: string): void {
    this.buffer += streamdata;
    const { start, end } = PIPE_DELIM;
    let s: number;
    let e: number;
    while (
      (s = this.buffer.indexOf(start)) !== -1 &&
      (e = this.buffer.indexOf(end, s + start.length)) !== -1
    ) {
      const payload = this.buffer.slice(s + start.length, e).trim();
      this.buffer = this.buffer.slice(e + end.length);
      this.chain = this.chain.then(() => this.cb(this.worker, payload));
    }
    // Discard junk that accumulates before any start delimiter so a corrupt
    // stream can't grow the buffer without bound.
    if (this.buffer.indexOf(start) === -1 && this.buffer.length > 1_000_000) {
      this.buffer = "";
    }
  }
}
