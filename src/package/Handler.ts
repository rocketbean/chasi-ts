import Obsesrver from "./Observer/index.js";
import horizon from "./statics/horizon/config.js";
import App from "./framework/Server/App.js";
import Base, { ProxyHandler } from "./Base.js";
import { ModuleInterface } from "./framework/Interfaces.js";
import { Writable } from "./Logger/types/Writer.js";
import { Iobject } from "./framework/Interfaces.js";

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
  $app: App = new App();

  private constructor(private config: Iobject) {
    super();
    this.config = Base.mergeObjects(horizon, config);
    this.setup();
  }

  protected async start(): Promise<void> {
    await this.$observer.setup();
    await this.$observer.emit("__before__", {
      next: this.$proxy.before,
      app: this.$proxy,
    });
    this.loggers.system.endGroup("apex");
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
    this.loggers.system.write(this.$modules);
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
    this.$observer = new Obsesrver(this.config.observer! as Iobject);
  }

  logthis(message: string, type: string = "system") {
    this.loggers[type].write(message.toUpperCase());
  }

  /***
   * Set System-Display Logs
   * @return [void]
   */
  protected setLoggers(): void {
    this.loggers = {
      system: global.Logger.writer("Left").style("system"),
      subsystem: global.Logger.writer("Left").style("subsystem"),
    };
  }

  static async init(config: object): Promise<Handler> {
    if (Handler._instance) return Handler._instance;
    Handler._instance = new Handler(<Iobject>config);
    await Handler._instance.start();
    return Handler._instance;
  }
}
