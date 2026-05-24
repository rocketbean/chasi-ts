import { createReadStream, createWriteStream } from "fs";
import { Writable } from "stream";
import { PassThrough } from "stream";
import { EventEmitter } from "events"
import cluster from "cluster";

const tunnel = new PassThrough();

class WriteStream extends Writable {
  public fd: number;
  public state: number = 0;
  constructor(public opts: { fd: number }) {
    super();
    this.fd = opts.fd;
  }

  async reqWS(): Promise<NodeJS.WritableStream> {
    return createWriteStream(null as unknown as string, {
      fd: this.fd,
      autoClose: true,
      emitClose: true,
    });
  }

  _write(chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    const sig = createWriteStream(null as unknown as string, {
      fd: this.fd,
      highWaterMark: 200,
      autoClose: true,
      emitClose: true,
    });
    sig.write(chunk, callback);
  }
}

export default class PipeHandler extends EventEmitter {
  public writer: WriteStream;
  public reader: NodeJS.ReadableStream;
  public events: string[] = [];
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

  format(byte: Buffer | string): void {
    try {
      const obj: Record<string, unknown> = JSON.parse(byte.toString());
      if (obj?.action) {
        this.emit(obj.action as string, obj.transmit);
      }
    } catch (e: unknown) { /* malformed message — ignore */ }
  }

  setReader() {
    let tunnel = new PassThrough();
    tunnel.on("data", (chunk) => {
      return this.format(chunk);
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
      chunk = "<=====|" + chunk + "|=====>";
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
