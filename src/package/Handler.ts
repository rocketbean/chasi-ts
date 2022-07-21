import Chasi from "./framework/Chasi/Terminal.js";
import App from "./framework/Server/App.js";
import Obsesrver from "./Observer/index.js";
import horizon from "./statics/horizon/config.js";
import Service from "./framework/Services/Service.js";
import ServicesModule from "./framework/Services/ServicesModule.js";
import Base, { ProxyHandler } from "./Base.js";
import Exception from "./framework/ErrorHandler/Exception.js";
import { Writable } from "./Logger/types/Writer.js";
import { Iobject } from "./framework/Interfaces.js";
import {
  ModuleInterface,
  ServiceProviderInterface,
} from "./framework/Interfaces.js";
import Session from "./framework/Chasi/Session.js";

export class Handler extends Base {
  /***
   * singleton [Handler];
   * handles the Lifecycle
   */
  private static _instance: Handler;

  $proxy = new Proxy(this, ProxyHandler);

  /**
   * Chasi generates a unique
   * runtime id to specify Chasi Sessions
   */
  private $runtime: Session;
  private $runtime_id: string;

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

  /***
   * App[state] represents the
   * Handler State with number:
   * ******
   * [0] unintiated
   * [1] before Handler is initiated
   * [2] Initializing Handler
   * [3] after initialization
   * [4] Handler on readystate
   */
  private _state: 0;

  $services: { [key: string]: Service };

  private constructor(private config: Iobject, private session: Chasi) {
    super();
    this.config = <Iobject>Base.mergeObjects(horizon, config);
    this.session = session;
    this.setup();
  }

  get state() {
    return this._state;
  }

  set state(v) {
    this._state = v;
  }

  /**
   * returns back the
   * private runtime id;
   */
  get runtimeId() {
    return this.$runtime_id;
  }

  /***
   * State[0]
   * Initializes the App [services|modules] part
   * and calling the [BeforeApp] event
   * which installs modules;
   * -----------------------------------|
   * • ServerSession will be created
   * • Caveat ErrorHandling initiated
   * • ServicesModules installation
   * • setup Observers [emitters]
   */
  protected async start(): Promise<void> {
    this.$runtime = await this.session.set(this.config, this);
    this.$runtime_id = this.$runtime.id;
    await this.$observer.setup();
    await Caveat.init(this.config.exceptions, this.$proxy);
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
   * STATE[1]
   * before everything will be
   * connected [before] event
   * will be fired;
   * Server preparation
   * ------------------------------|
   * • DatabaseModule initialization
   * • Router initialization
   */
  protected async before(): Promise<void> {
    await this.$observer.emit("__initialize__", {
      next: this.$proxy.initialize,
      app: this.$proxy,
    });
  }

  /***
   * STATE[2]
   * initializing Handler state
   * getting ready for boot
   * --------------------------|
   * • Router layers will be consumed
   */
  protected async initialize() {
    try {
      await this.$observer.emit("__after__", {
        next: this.$proxy.after,
        app: this.$proxy,
      });
    } catch (e) {}
  }

  /**
   *  STATE[3]
   * After Handler was initiated
   *
   */
  protected async after() {
    await this.$observer.emit("__boot__", {
      next: this.$proxy.boot,
      app: this.$proxy,
    });
  }

  protected async boot() {
    this.loggers.system.group("BOOT");
    await this.$app.bootup();
    await this.session.cacheSession(this.$runtime_id);
    this.loggers.system.endGroup("BOOT");
  }

  /**
   * modules from out of the box
   * App installation
   * @param module ModuleInterface
   */
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

  static async init(property: Iobject): Promise<Handler> {
    if (Handler._instance) return Handler._instance;
    Handler._instance = new Handler(property.config, property.chasi);
    global.$app = Handler._instance;
    await Handler._instance.start();
    return Handler._instance;
  }
}
