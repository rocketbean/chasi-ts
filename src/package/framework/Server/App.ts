import http from "http";
import https from "https";
import Consumer from "./Consumer.js";
import Base from "../../Base.js";
import cors from "cors";
import Authentication from "./Authentication.js";
import { Iobject, serverConfig } from "../Interfaces.js";
import { PortRange } from "./Server.types.js";
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

  private _resolvePorts(): number[] {
    const p = this.config.port;
    if (Array.isArray(p)) return p;
    if (typeof p === "object" && "start" in p) {
      const { start, end } = p as PortRange;
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    const str = String(p).trim();
    const range = str.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]), end = Number(range[2]);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    if (str.includes(",")) {
      return str.split(",").map(s => Number(s.trim())).filter(n => n > 0);
    }
    return [Number(str)];
  }

  private _tryListen(ports: number[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const attempt = (i: number): void => {
        if (i >= ports.length) {
          reject(new Error(`All ports in [${ports.join(", ")}] are in use`));
          return;
        }
        const port = ports[i];
        const onError = (err: NodeJS.ErrnoException): void => {
          if (err.code === "EADDRINUSE") attempt(i + 1);
          else reject(err);
        };
        this.$httpServer.once("error", onError);
        this.$httpServer.listen(port, () => {
          this.$httpServer.removeListener("error", onError);
          resolve(port);
        });
      };
      attempt(0);
    });
  }

  async bootup(): Promise<void> {
    await this.install();
    const port = await this._tryListen(this._resolvePorts());
    this.config.port = port;
    process.env.ServerPort = String(port);
    global.__basepath = `${this.mode.protocol}://localhost:${port}`;
    this.loggers.full.write("SERVING IN: ", "cool", "boot");
    App.servelog.forEach((str) => {
      this.loggers.EndTraceFull.write(
        `╟► ${this.mode.protocol}://localhost:${port}${str}`,
        "systemRead",
        "boot",
      );
    });
    const nets = networkInterfaces();
    Object.keys(nets).forEach((key) => {
      nets[key]
        .filter((addr) => addr.family == "IPv4")
        .forEach((net) => {
          const ipv = net.address == "127.0.0.1" ? "localhost" : net.address;
          this.loggers.EndTraceFull.write(
            `╟► ${this.mode.protocol}://${ipv}:${port}`,
            "systemRead",
            "boot",
          );
        });
    });
    this.loggers.EndTraceFull.write("╟", "systemRead", "boot");
  }
}
