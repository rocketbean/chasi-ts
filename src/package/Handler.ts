import Obsesrver from "./Observer/index.js";
import horizon from "./statics/horizon/config.js";
import Service from "./framework/Services/Service.js";
import ServicesModule from "./framework/Services/ServicesModule.js";
import App from "./framework/Server/App.js";
import Base, { ProxyHandler } from "./Base.js";
import { Writable } from "./Logger/types/Writer.js";
import { Iobject } from "./framework/Interfaces.js";
import { networkInterfaces } from "os";
import {
  ModuleInterface,
  ServiceProviderInterface,
} from "./framework/Interfaces.js";

export class Handler extends Base {
  /***
   * singleton [Handler];
   * handles the Lifecycle
   */
  private static _instance: Handler;

  $proxy = new Proxy(this, ProxyHandler);

  /***
   * APP STATUS
   * LifeCycle Process:
   *  [off] - unintialized, on <= [static init()];
   *  [initializing] - on <= [async before()];
   *  [instantiating] - on <= [async instantiate()];
   *  [initialized] - on > [async boot()];
   */
  private status: "off" | "initializing" | "instantiating" | "initialized" =
    "off";

  /***
   * [loggers] Log Handlers
   */
  private loggers: { [key: string]: Writable } = {};

  /***
   * [$observer] EventHandler
   */
  $observer: Obsesrver;

  /***
   * [$modules] EventHandler
   */
  $modules: { [key: string]: ModuleInterface } = {};

  /***
   * [$app] Express App
   */
  $app: App;

  $services: { [key: string]: Service };

  private constructor(private config: Iobject) {
    super();
    this.config = <Iobject>Base.mergeObjects(horizon, config);
    this.setup();
  }

  protected async start(): Promise<void> {
    await this.$observer.setup();
    this.$modules["services"] = await ServicesModule.init(
      this.config.container.ServiceBootstrap,
    );
    this.$services = (await (<ServicesModule>(
      this.$modules["services"]
    )).installServices()) as { [key: string]: Service };

    await this.$observer.emit("__before__", {
      next: this.$proxy.before,
      app: this.$proxy,
    });
  }

  protected async before(): Promise<void> {
    await this.$observer.emit("__initialize__", {
      next: this.$proxy.initialize,
      app: this.$proxy,
    });
  }

  protected async initialize() {
    await this.$observer.emit("__after__", {
      next: this.$proxy.after,
      app: this.$proxy,
    });
  }
  protected async after() {
    await this.$observer.emit("__boot__", {
      next: this.$proxy.boot,
      app: this.$proxy,
    });
  }

  protected async boot() {
    this.$app.$server.listen(this.config.server.port, async () => {
      this.loggers.system.group("BOOT");
      this.loggers.full.write("SERVING IN: ", "cool");
      let nets = networkInterfaces();
      Object.keys(nets).forEach((key) => {
        nets[key]
          .filter((addr) => addr.family == "IPv4")
          .forEach((net) => {
            let protocol = this.$app.mode.protocol;
            let ipv = net.address == "127.0.0.1" ? "localhost" : net.address;
            this.loggers.EndTraceFull.write(
              `  ${protocol}://${ipv}:${this.config.server.port}`,
              "systemRead",
            );
          });
      });
      this.loggers.system.endGroup("BOOT");
    });
  }

  private installModule(module: ModuleInterface) {
    this.$modules[module.constructor.name] = module;
  }

  /***
   * initial setup before
   * App [Singleton] Instance
   * @return [void]
   */
  protected setup(): void {
    this.setLoggers();
    this.$app = new App(this.config.server);
    this.$observer = new Obsesrver(this.config.observer! as Iobject);
  }

  logthis(message: string, type: string = "system") {
    this.loggers[type].write(message.toUpperCase());
  }

  /***
   * Set System-Display Log
   * @return [void]
   */
  protected setLoggers(): void {
    this.loggers = {
      system: global.Logger.writer("Left").style("system"),
      subsystem: global.Logger.writer("Left").style("subsystem"),
      center: global.Logger.writer("Center").style("cool"),
      full: global.Logger.writer("Full").style("cool"),
      LeftFull: global.Logger.writer("LeftFull").style("cool"),
      EndTraceFull: global.Logger.writer("EndTraceFull").style("cool"),
    };
  }

  static async init(config: object): Promise<Handler> {
    if (Handler._instance) return Handler._instance;
    Handler._instance = new Handler(<Iobject>config);
    await Handler._instance.start();
    return Handler._instance;
  }
}
