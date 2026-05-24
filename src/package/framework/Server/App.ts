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
  $httpServer: http.Server | https.Server;
  env: string;
  mode: { protocol: "http" | "https"; key?: string; cert?: string };
  protocol: typeof http | typeof https;
  private auth: Authentication;
  private _basepath: string;
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

  get basepath(): string {
    return `${this.mode.protocol}://localhost:${this.config.port}`
  }

  /**
   * actual booting of Http/Https Server
   * fetching certificate and key file
   */
  async install(): Promise<void> {
    const serverConfig: { cert?: Buffer | string; key?: Buffer | string } = {};
    if (this.mode.key != null && this.mode.cert != null) {
      serverConfig.key = Base._fsFetchFile(this.mode.key);
      serverConfig.cert = Base._fsFetchFile(this.mode.cert);
    }
    this.$server.use(cors(this.config.cors));
    this.$httpServer = (this.protocol as typeof http).createServer(serverConfig as http.ServerOptions, this.$server as unknown as http.RequestListener);
    return;
  }

  /**
   * Initializes the Authentication layer
   */
  async setAuthLayer(authConfig: Iobject): Promise<void> {
    this.auth = new Authentication(authConfig);
    await this.auth.init();
  }

  async bootup(): Promise<void> {
    global.__basepath = `${this.mode.protocol}://localhost:${this.config.port}`;
    await this.install();
    return new Promise<void>((res, rej) => {
      this.$httpServer.on("error", (err: Error) => rej(err));
      this.$httpServer.listen(this.config.port, async () => {
        this.loggers.full.write("SERVING IN: ", "cool", "boot");
        App.servelog.forEach((str) => {
          let protocol = this.mode.protocol;
          this.loggers.EndTraceFull.write(
            `╟► ${protocol}://localhost:${this.config.port}${str}`,
            "systemRead",
            "boot",
          );
        });
        let nets = networkInterfaces();
        Object.keys(nets).forEach((key) => {
          nets[key]
            .filter((addr) => addr.family == "IPv4")
            .forEach((net) => {
              let protocol = this.mode.protocol;
              let ipv = net.address == "127.0.0.1" ? "localhost" : net.address;
              this.loggers.EndTraceFull.write(
                `╟► ${protocol}://${ipv}:${this.config.port}`,
                "systemRead",
                "boot",
              );
            });
        });
        this.loggers.EndTraceFull.write("╟", "systemRead", "boot");
        res();
      });
    });
  }
}
