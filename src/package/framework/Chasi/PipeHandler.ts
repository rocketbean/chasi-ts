import { createReadStream, createWriteStream } from "fs";
import { Writable } from "stream";
import net, { Socket } from "net";
import { PassThrough } from "stream";
import { EventEmitter } from "events";
import { exit } from "process";
const tunnel = new PassThrough();

class WriteStream extends Writable {
  public fd;
  public state = 0;
  constructor(public opts) {
    super();
    this.fd = opts.fd;
  }

  async reqWS() {
    return await createWriteStream(null, {
      fd: this.fd,
      autoClose: true,
      emitClose: true,
    });
  }

  async _write(chunk, encoding, callback) {
    return new Promise(async (res, rej) => {
      let sig = createWriteStream(null, {
        fd: this.fd,
        autoClose: true,
        emitClose: true,
      });
      res(await sig.write(chunk, callback));
    });
  }
}

export default class PipeHandler extends EventEmitter {
  public writer: any;
  public reader: any;
  public events: [] = [];
  constructor() {
    super();
    this.writer = new WriteStream({ fd: 3 });
    this.reader = createReadStream(null, { fd: 4 });
    this.setReader();
  }

  format(byte) {
    let obj = JSON.parse(byte.toString());
    if (obj?.action) {
      this.emit(obj.action, obj.transmit);
    }
  }

  setReader() {
    let tunnel = new PassThrough();
    tunnel.on("data", (chunk) => {
      return this.format(chunk);
    });
    this.reader.pipe(tunnel);
  }

  async write(data) {
    return await this.writer.write(JSON.stringify(data) + "\n");
  }

  async getAsync(data) {
    data.action = data.action + "_" + process.pid;
    return new Promise(async (res, rej) => {
      let result;
      this.once(data.action, (d) => {
        res(d);
      });
      await this.write(data);
    });
  }
}
