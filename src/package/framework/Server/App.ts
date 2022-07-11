import Express from "express";
import http from "http";
import https from "https";
import { serverConfig } from "../Interfaces.js";
import { networkInterfaces } from "os";
import { Writable } from "../../Logger/types/Writer.js";
export default class App {
  $server: any = Express();
  server: any;
  env: string;
  mode: { [key: string]: any };
  protocol: any;

  constructor(
    public config: serverConfig,
    private loggers: { [key: string]: Writable },
  ) {
    this.config = config;
    this.setEnvironment();
    this.loggers = loggers;
  }

  setEnvironment() {
    this.mode = this.config.modes[this.config.environment];
    if (this.mode.protocol == "https") this.protocol = https;
    else this.protocol = http;
  }

  install() {
    this.server = this.protocol.createServer({}, this.$server);
  }

  async bootup(): Promise<void> {
    return new Promise((res, rej) => {
      this.$server.listen(this.config.port, async () => {
        this.loggers.full.write("SERVING IN: ", "cool");
        let nets = networkInterfaces();
        Object.keys(nets).forEach((key) => {
          nets[key]
            .filter((addr) => addr.family == "IPv4")
            .forEach((net) => {
              let protocol = this.mode.protocol;
              let ipv = net.address == "127.0.0.1" ? "localhost" : net.address;
              this.loggers.EndTraceFull.write(
                `  ${protocol}://${ipv}:${this.config.port}`,
                "systemRead",
              );
            });
          res();
        });
      });
    });
  }
}
