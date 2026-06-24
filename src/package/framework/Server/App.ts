import http from "http";
import https from "https";
import path from "path";
import Consumer from "./Consumer.js";
import Base from "../../Base.js";
import cors from "cors";
import Authentication from "./Authentication.js";
import { Iobject, serverConfig } from "../Interfaces.js";
import type { PortRange } from "./Server.types.js";
import { networkInterfaces } from "os";
import { Writable } from "../../Logger/types/Writer.js";

/** Loaded TLS material handed to (http|https).createServer(). */
type TLSServerConfig = {
  key?: Buffer | string;
  cert?: Buffer | string;
  ca?: (Buffer | string)[];
};

export default class App extends Consumer {
  $httpServer: http.Server | https.Server;
  env: string;
  mode: {
    protocol: "http" | "https";
    key?: string;
    cert?: string;
    ca?: string | string[];
  };
  protocol: typeof http | typeof https;
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

  get basepath(): string {
    return `${this.mode.protocol}://localhost:${this.config.port}`
  }

  /**
   * actual booting of Http/Https Server
   * fetching certificate and key file
   */
  async install(): Promise<void> {
    const serverConfig: TLSServerConfig = {};
    if (this.mode.protocol == "https") this._loadTLSCredentials(serverConfig);
    this.$server.use(cors(this.config.cors));
    try {
      this.$httpServer = (this.protocol as typeof http).createServer(
        serverConfig as http.ServerOptions,
        this.$server as unknown as http.RequestListener,
      );
    } catch (e) {
      // createServer builds the TLS secure context up front, so a key/cert
      // mismatch or a malformed PEM is raised right here rather than on the
      // first request — translate it into an actionable message.
      this._reportTLSError(e as NodeJS.ErrnoException);
    }
    return;
  }

  /**
   * Loads the TLS key + certificate (and optional CA chain) for HTTPS mode and
   * surfaces a clear, actionable error for the failures users actually hit:
   *  - one or both paths are not configured for the active mode
   *  - a file is missing or cannot be read on disk
   * (A key/cert mismatch or malformed PEM is raised later by createServer
   *  and reported by {@link _reportTLSError}.)
   */
  private _loadTLSCredentials(serverConfig: TLSServerConfig): void {
    const missing: string[] = [];
    if (this.mode.key == null) missing.push("key");
    if (this.mode.cert == null) missing.push("cert");
    if (missing.length) {
      Logger.error(
        `HTTPS is enabled for the "${this.config.environment}" mode but no ` +
          `${missing.join(" and ")} ${missing.length > 1 ? "paths are" : "path is"} configured.`,
        `Set the cert/key paths under config/server → modes.${this.config.environment} ` +
          `(or the env vars they read from).`,
      );
      throw new Error(
        `Missing HTTPS ${missing.join("/")} configuration for "${this.config.environment}" mode.`,
      );
    }

    serverConfig.key = this._readTLSFile("key", this.mode.key as string);
    serverConfig.cert = this._readTLSFile("cert", this.mode.cert as string);

    // Optional: a CA chain supplied separately, so users don't have to bundle
    // the intermediate/root certs into `cert`. Accepts one path or many.
    if (this.mode.ca != null) {
      const caPaths = (Array.isArray(this.mode.ca) ? this.mode.ca : [this.mode.ca]).filter(
        (p): p is string => p != null && p !== "",
      );
      if (caPaths.length) {
        serverConfig.ca = caPaths.map((p) => this._readTLSFile("ca", p));
      }
    }
  }

  /**
   * Reads a single TLS file, mapping low-level fs errors to a readable reason.
   */
  private _readTLSFile(label: "key" | "cert" | "ca", filepath: string): Buffer | string {
    const resolved = path.resolve(___location, filepath);
    try {
      return Base._fsFetchFile(filepath);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      let reason: string;
      switch (err.code) {
        case "ENOENT":
          reason = "file not found";
          break;
        case "EACCES":
          reason = "permission denied";
          break;
        case "EISDIR":
          reason = "path is a directory, not a file";
          break;
        default:
          reason = err.message || "unable to read file";
      }
      Logger.error(
        `Failed to load HTTPS ${label} file (${reason}).\n  configured: ${filepath}\n  resolved:   ${resolved}`,
      );
      throw new Error(`Unable to load HTTPS ${label} file "${filepath}": ${reason}.`);
    }
  }

  /**
   * Translates an error thrown while building the HTTPS server (most commonly
   * a key/cert mismatch or a corrupt/invalid PEM) into a clear message.
   */
  private _reportTLSError(err: NodeJS.ErrnoException): never {
    const msg = err?.message ?? String(err);
    const code = err?.code ?? "";
    let hint: string;
    if (code === "ERR_OSSL_X509_KEY_VALUES_MISMATCH" || /key values mismatch/i.test(msg)) {
      hint = "The key and certificate do not match — they must be a matching pair.";
    } else if (/PEM|no start line|bad|asn1|decode|wrong tag/i.test(msg)) {
      hint = "The key or certificate is not valid PEM, or the file is corrupted.";
    } else {
      hint = "The HTTPS server could not be initialized with the provided credentials.";
    }
    Logger.error(
      "Failed to start HTTPS server.",
      `  ${hint}`,
      `  key:   ${this.mode.key}`,
      `  cert:  ${this.mode.cert}`,
      ...(this.mode.ca != null
        ? [`  ca:    ${Array.isArray(this.mode.ca) ? this.mode.ca.join(", ") : this.mode.ca}`]
        : []),
      `  cause: ${msg}`,
    );
    throw new Error(`HTTPS setup failed: ${hint}`);
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
