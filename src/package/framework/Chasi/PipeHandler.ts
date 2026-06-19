import { createReadStream, createWriteStream } from "fs";
import { Writable } from "stream";
import { PassThrough } from "stream";
import { EventEmitter } from "events"
import cluster from "cluster";

const tunnel = new PassThrough();

class WriteStream extends Writable {
  public fd: number;
  public state: number = 0;
  // A single persistent sink kept open for the life of the process. The old
  // implementation opened a fresh createWriteStream (autoClose: true) on fd 3
  // for every _write — concurrent streams raced on the same fd and an early
  // autoClose could shut fd 3 before later writes flushed, dropping messages.
  private sink: NodeJS.WritableStream;
  constructor(public opts: { fd: number }) {
    super();
    this.fd = opts.fd;
    this.sink = createWriteStream(null as unknown as string, {
      fd: this.fd,
      autoClose: false,
    });
  }

  _write(chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.sink.write(chunk as Buffer | string, callback);
  }
}

// Frame delimiters shared by both pipe directions. Worker→primary frames are
// reassembled by StreamBucket; primary→worker frames are reassembled below.
export const PIPE_DELIM = { start: "<=====|", end: "|=====>" };

export default class PipeHandler extends EventEmitter {
  public writer: WriteStream;
  public reader: NodeJS.ReadableStream;
  public events: string[] = [];
  // Carries bytes across "data" chunks so frames split or coalesced by the
  // stream layer are reassembled before parsing.
  private inbound: string = "";
  constructor() {
    super();
    this.writer = new WriteStream({ fd: 3 });

    this.reader = createReadStream(null, {
      fd: 4,
      highWaterMark: 200,
      autoClose: true,
      emitClose: true
    });
    this.setReader();
  }

  format(payload: string): void {
    try {
      const obj: Record<string, unknown> = JSON.parse(payload);
      if (obj?.action) {
        this.emit(obj.action as string, obj.transmit);
      }
    } catch (e: unknown) { /* malformed message — ignore */ }
  }

  setReader() {
    const { start, end } = PIPE_DELIM;
    let tunnel = new PassThrough();
    tunnel.on("data", (chunk) => {
      this.inbound += chunk.toString();
      let s: number;
      let e: number;
      // Drain every complete frame currently buffered. Incomplete tails stay in
      // [inbound] until the rest of the bytes arrive on a later chunk.
      while (
        (s = this.inbound.indexOf(start)) !== -1 &&
        (e = this.inbound.indexOf(end, s + start.length)) !== -1
      ) {
        const payload = this.inbound.slice(s + start.length, e);
        this.inbound = this.inbound.slice(e + end.length);
        this.format(payload);
      }
      // Guard against unbounded growth if junk arrives with no start delimiter.
      if (this.inbound.indexOf(start) === -1 && this.inbound.length > 1_000_000) {
        this.inbound = "";
      }
    });
    this.reader.pipe(tunnel);
  }

  async write(data: Record<string, unknown>): Promise<void> {
    try {
      data.worker = {
        pid: cluster.worker.process.pid,
        id: cluster.worker.id,
      };
      let chunk = JSON.stringify(data);
      chunk = PIPE_DELIM.start + chunk + PIPE_DELIM.end;
      await this.writer.write(chunk);
    } catch (e: unknown) {
      Logger.log("pipeErr::Write ", e);
      Logger.log(data);
    }
  }

  async getAsync(data: Record<string, unknown>): Promise<unknown> {
    data.action = (data.action as string) + "_" + process.pid;
    return new Promise<unknown>((res) => {
      this.once(data.action as string, (d: unknown) => {
        res(d);
      });
      this.write(data);
    });
  }
}
