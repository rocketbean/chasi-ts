import Obsesrver from "./Observer/index.js";
import horizon from "./statics/horizon/config.js";
import Service from "./framework/Services/Service.js";
import ServicesModule from "./framework/Services/ServicesModule.js";
import App from "./framework/Server/App.js";
import Base, { ProxyHandler } from "./Base.js";
import { Writable } from "./Logger/types/Writer.js";
import { Iobject } from "./framework/Interfaces.js";
import { networkInterfaces } from "os";
import RouterModule from "./framework/Router/RouterModule.js";
import Router from "./framework/Router/Router.js";

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

  /***
   * Initializes the App [services|modules] part
   * and calling the [BeforeApp] event
   * which installs modules;
   */
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

  /***
   * before everything will be
   * connected [before] method
   * will be fired
   */
  protected async before(): Promise<void> {
    await this.$observer.emit("__initialize__", {
      next: this.$proxy.initialize,
      app: this.$proxy,
    });
  }

  /***
   * initialize Server
   * • Register RouteLayers
   */
  protected async initialize() {
    try {
      await this.$observer.emit("__after__", {
        next: this.$proxy.after,
        app: this.$proxy,
      });
    } catch (e) {
      console.log(e);
    }
  }
  protected async after() {
    await this.$observer.emit("__boot__", {
      next: this.$proxy.boot,
      app: this.$proxy,
    });
  }

  protected async boot() {
    this.loggers.system.group("BOOT");
    await this.$app.bootup();
    this.loggers.system.endGroup("BOOT");
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
    this.$app = new App(this.config.server, this.loggers);
    this.$observer = new Obsesrver(this.config.observer as Iobject);
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
