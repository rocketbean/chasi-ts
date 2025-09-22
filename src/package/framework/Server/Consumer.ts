import {
  serverConfig,
  AppException,
  Iobject,
  ServiceProviderInterface,
  ProviderInterface,
  RouterMountable,
} from "../Interfaces.js";
import exception from "../ErrorHandler/Exception.js";
import Router from "../Router/Router.js";
import Express, { response } from "express";
import Models from "../Database/Models.js";
import APIException from "../ErrorHandler/exceptions/APIException.js";
import { Handler } from "../../Handler.js";
import process from "process";
export default class Consumer {
  $server: any = Express();
  public static servelog: string[] = [];
  /* * * *
   * Router Consumer
   * registers the routing layer
   * to the [Express]server
   */
  static _defaultResponses = {};
  public $routers: Router[] = [];
  constructor(public config: serverConfig) {
    this.config = config;
  }

  /** * * [consume()]
   * consumes the routing layer
   * attaches the [Endpoint] instance
   * to express server.
   * [Enpoint::class]
   * @param router Router Container
   */
  async consume(router: Router): Promise<void> {
    for (let r in router.$registry.routes) {
      let ep = router.$registry.routes[r];
      this.$server[ep.property.method](
        ep.path,
        ep.useAuth,
        ...ep.$middlewares,
        async (request, response) => {
          try {
            let data: Function = () => {};
            if (ep.isDynamic) await this.bindModel(request.params);
            if (router.property?.data) {
              if (ep?.$controller) ep.$controller.$data = router.property.data;
              data = router.property.data;
            }
            await Promise.all(
              ep.beforeFns.map(async (fn: Function) => {
                await fn(request, response, data);
              })
            );
            let res = await ep.$method(request, response, data);
            ep.afterFns.map(async (fn: Function) => {
              await fn(request, response, res, data);
            });
            response.send(res);
          } catch (e: any) {
            return await this.handleError(e, ep, response);
          }
        }
      );
    }
  }

  async mounts(router: Router): Promise<void> {
    await Promise.all(
      router.property?.mount.map(async (mount: RouterMountable) => {
        if (!mount?.props) mount.props = [];
        await mount.exec?.mount(router, [...mount.props]);
      })
    );
  }

  /** * [handleError()]
   * Handles the [Request]Endpoint Error
   * wrapping the error on an [APIException]::class
   * and executes a log, before sending
   * a client response.
   */
  async handleError(e, ep, response): Promise<void> {
    let status = e.status ? e.status : 500;
    let autoMs = Consumer._defaultResponses[status]
      ? Consumer._defaultResponses[status]
      : Consumer._defaultResponses["message"];
    e["message"] = e?.message ? e.message : autoMs;
    if (!(e instanceof exception)) {
      e = new APIException(e, status, ep);
    }
    let contentType = response.getHeaders()["content-type"];
    if (
      contentType?.includes("application/json") &&
      typeof e.message !== "object"
    ) {
      e.message = { message: e.message };
    }
    ep.addExceptions(e);
    response.statusCode = status;
    response.send(e.message);
  }

  /** * [bindModel()]
   * binding parameters to the model if a model is found,
   * it attaches the model[collection] to the
   * request via (findById)
   */
  async bindModel(params: Iobject): Promise<void> {
    try {
      await Promise.all(
        Object.keys(params).map(async (mod) => {
          if (mod.toLowerCase() in Models.collection) {
            params[`__${mod.toLowerCase()}`] = await Models.collection[
              mod.toLowerCase()
            ].findById(params[mod]);
          } else {
            params[`__${mod.toLowerCase()}`] = null;
          }
        })
      );
    } catch (e) {}
  }

  /** *
   * BootLoads services
   * from server perspective
   * calling the ServerBoot(app) function
   * if it is provided,
   * exposing the express instance
   * where they can use methods like
   * [express.all(), express.use(), etc...]
   */
  async bootFromProviders(): Promise<void> {
    let mods = Handler.Instance.$modules.services["$container"];
    await Promise.all(
      Object.values(mods).map(async (service: any) => {
        if (service.instance?.beforeServerBoot) {
          return await service.instance.beforeServerBoot(this.$server);
        }
      })
    );
  }

  /** *
   * invoked before consuming routes
   * exposing the express instance
   * where they can use methods like
   * [express.all(), express.use(), etc...]
   */
  async beforeRouteConsume(): Promise<void> {
    let mods = Handler.Instance.$modules.services["$container"];
    await Promise.all(
      Object.values(mods).map(async (service: any) => {
        if (service.instance?.beforeRoute) {
          return await service.instance.beforeRoute(this.$server);
        }
      })
    );
  }

  /** * [consumeLayers]
   * routing layer consumption
   * ♦ consumes the routing layer
   * ♦ registers the routing layer
   * ♦ attaches the engine if enabled
   * @param options Compiler options
   * @param engine CompilerEngine::class
   * @param compiler EngineDriver::class
   * @returns void;
   *
   */
  async consumeLayers(
    options: Iobject,
    engine?: Iobject,
    compiler?: any
  ): Promise<void> {
    await this.beforeRouteConsume();

    for (let r in this.$routers) {
      let router = this.$routers[r];
      await this.consume(router);
    }
    await this.bootFromProviders();

    for (let r in this.$routers) {
      let router = this.$routers[r];
      if (router.property?.mount) await this.mounts(router);
    }

    this.$server.use((req, res, next) => {
      res.status(404).send(Consumer._defaultResponses["404"]);
    });
  }
}
