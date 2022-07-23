import http from "http";
import https from "https";
import Consumer from "./Consumer.js";
import Base from "../../Base.js";
import cors from "cors";
import Authentication from "./Authentication.js";
import { Iobject, serverConfig } from "../Interfaces.js";
import { networkInterfaces } from "os";
import { Writable } from "../../Logger/types/Writer.js";

export default class App extends Consumer {
  server: any;
  env: string;
  mode: { [key: string]: any };
  protocol: any;
  private auth: Authentication;
  constructor(
    public config: serverConfig,
    private loggers: { [key: string]: Writable },
  ) {
    super(config);
    this.config = config;
    this.setEnvironment();
    this.loggers = loggers;
  }

  /**
   * setting up protocol
   * based on environment
   * selected on config/server
   */
  setEnvironment() {
    this.mode = this.config.modes[this.config.environment];
    if (this.mode.protocol == "https") this.protocol = https;
    else this.protocol = http;
  }

  /**
   * actual booting of Http/Https Server
   * fetching certificate and key file
   * to
   */
  async install() {
    let serverConfig: { cert?: any; key?: any } = {};
    if (this.mode.key != null && this.mode.cert != null) {
      serverConfig = {
        key: Base._fsFetchFile(this.mode.key),
        cert: Base._fsFetchFile(this.mode.cert),
      };
    }
    this.$server.use(cors(this.config.cors));
    this.$server = this.protocol.createServer(serverConfig, this.$server);
  }

  /**
   * Initializes the Authentication layer
   */
  async setAuthLayer(authConfig: Iobject) {
    this.auth = new Authentication(authConfig);
    await this.auth.init();
  }

  async bootup(): Promise<void> {
    await this.install();
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
