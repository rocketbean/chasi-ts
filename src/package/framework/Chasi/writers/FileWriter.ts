import fs from "fs";
import path from "path";
export default class SessionWriter {
  constructor(public file: string) {
    this.file = path.join(__dirname + file);
  }
  async write(message: any) {
    let write = new Promise((res, rej) => {
      fs.appendFile(this.file, message, (err) => {
        if (err)
          rej(console.error(err, `failed to write file:: [${this.file}]`));
        res(true);
      });
    });
  }
}
