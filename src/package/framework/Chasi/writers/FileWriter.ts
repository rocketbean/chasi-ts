import fs, { existsSync, mkdirSync } from "fs";
import path from "path";
import chalk from "chalk";
import util from "util";
export default class SessionWriter {
  public writer;
  public rawPath;
  constructor(public storage: string) {
    this.storage = path.join(__dirname + storage);
    this.rawPath = storage;
    this.checkDir();
  }

  async writeObject(data: any) {
    fs.writeFile(this.storage, JSON.stringify(data), (err) => {
      if (err) console.log(err);
    });
  }

  checkDir() {
    this.rawPath.split("/").reduce((prev, cur, i) => {
      if (!cur.includes(".chasi")) {
        if (i == 1) prev = path.join(__dirname + prev);
        cur = path.join(prev, cur);
        if (!existsSync(cur)) mkdirSync(cur, { recursive: true });
      }
      return cur;
    });
  }

  async write(data: any) {
    let str = "\n";
    Object.keys(data).forEach((group) => {
      if (data[group].length > 0) {
        str += chalk.dim.bold.bgRgb(15, 100, 204).rgb(0, 0, 24)(
          `\n • ${group.toUpperCase()} \n`,
        );
        str += "\n";
        str += data[group].map((message) => `  ${message}`).join("");
      }
    });

    fs.writeFile(this.storage, str, (err) => {
      if (err) console.log(err);
    });
  }
}
