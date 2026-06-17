import http from "http";
import https from "https";
import Consumer from "./Consumer.js";
import Base from "../../Base.js";
import cors from "cors";
import Authentication from "./Authentication.js";
import { Iobject, serverConfig } from "../Interfaces.js";
import type { PortRange } from "./Server.types.js";
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
    const toPort = (v: unknown): number | null => {
      const n = typeof v === "number" ? v : Number(String(v).trim());
      return Number.isInteger(n) && n >= 1 && n <= 65535 ? n : null;
    };

    const p: unknown = this.config.port;
    if (Array.isArray(p)) {
      const ports = p.map(toPort).filter((n): n is number => n !== null);
      if (ports.length === 0) throw new Error("Invalid port list (empty after validation)");
      return ports;
    }

    if (p && typeof p === "object" && "start" in (p as any) && "end" in (p as any)) {
      const start = toPort((p as PortRange).start);
      const end = toPort((p as PortRange).end);
      if (start === null || end === null || end < start) {
        throw new Error(`Invalid port range: ${JSON.stringify(p)}`);
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    const str = String(p ?? "").trim();
    const range = str.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = toPort(range[1]);
      const end = toPort(range[2]);
      if (start === null || end === null || end < start) {
        throw new Error(`Invalid ServerPort range: "${str}"`);
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    if (str.includes(",")) {
      const ports = str.split(",").map(toPort).filter((n): n is number => n !== null);
      if (ports.length === 0) throw new Error(`Invalid ServerPort list: "${str}"`);
      return ports;
    }

    const single = toPort(str);
    if (single === null) throw new Error(`Invalid ServerPort value: "${str}"`);
    return [single];
  }

  private _tryListen(ports: number[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const attempt = (i: number): void => {
        if (i >= ports.length) {
          reject(new Error(`All ports in [${ports.join(", ")}] are in use`));
          return;
        }
        const port = ports[i];
        // onListening/onError are paired per attempt and must be explicitly
        // removed when an attempt fails — otherwise each failed listen(port, cb)
        // call accumulates a stale "listening" once-listener, and the first
        // registered one (port 3010) fires when the server finally binds on
        // a later port (e.g. 3012), resolving the Promise with the wrong port.
        const onListening = (): void => {
          this.$httpServer.removeListener("error", onError);
          resolve(port);
        };
        const onError = (err: NodeJS.ErrnoException): void => {
          this.$httpServer.removeListener("listening", onListening);
          if (err.code === "EADDRINUSE") attempt(i + 1);
          else reject(err);
        };
        this.$httpServer.once("listening", onListening);
        this.$httpServer.once("error", onError);
        this.$httpServer.listen(port);
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
