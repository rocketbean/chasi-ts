import { serverConfig, AppException, Iobject } from "../Interfaces.js";
import exception from "../ErrorHandler/Exception.js";
import Router from "../Router/Router.js";
import Express, { response } from "express";
import Models from "../Database/Models.js";
import APIException from "../ErrorHandler/exceptions/APIException.js";
import { exit } from "process";

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

  /* * * [consume]
   * consumes the routing layer
   * [Enpoint::class]
   * @param router Router Container
   */
  async consume(router: Router) {
    for (let r in router.$registry.routes) {
      let ep = router.$registry.routes[r];
      this.$server[ep.property.method](
        ep.path,
        ep.useAuth,
        ...ep.$middlewares,
        async (request, response) => {
          try {
            if (Object.keys(request.params).length > 0)
              await this.bindModel(request.params);
            await Promise.all(
              ep.beforeFns.map(async (fn: Function) => {
                await fn(request, response);
              }),
            );
            let res = await ep.$method(request, response);
            ep.afterFns.map(async (fn: Function) => {
              await fn(request, response, res);
            });
            response.send(res);
          } catch (e: any) {
            return await this.handleError(e, ep, response);
          }
        },
      );
    }
  }

  async handleError(e, ep, response) {
    let status = e.status ? e.status : 500;
    let autoMs = Consumer._defaultResponses[status]
      ? Consumer._defaultResponses[status]
      : Consumer._defaultResponses["message"];
    e.message = e.message ? e.message : autoMs;
    if (!(e instanceof exception)) {
      e = new APIException(e, status, ep);
    }
    ep.addExceptions(e);
    response.statusCode = status;
    response.send(e.message);
  }

  /* * * [bindModel]
   * binding parameters to the model
   * if a model is found,
   * it attaches the
   * model[collection] to the
   * request via (findById)
   *
   */
  async bindModel(params) {
    await Promise.all(
      Object.keys(params).map(async (mod) => {
        if (mod in Models.collection) {
          params[`__${mod}`] = await Models.collection[mod].findById(
            params[mod],
          );
        }
      }),
    );
  }

  /* * * [consumeLayers]
   * routing layer consumption
   * ♦ consumes the routing layer
   * ♦ registers the routing layer
   * ♦ attaches the engine if enabled
   * @param options Compiler options
   * @param engine CompilerEngine::class
   * @param compiler EngineDriver::class
   */
  async consumeLayers(options: Iobject, engine?: Iobject, compiler?: any) {
    try {
      for (let r in this.$routers) {
        let router = this.$routers[r];
        await this.consume(router);
      }
      if (options.enabled) {
        if (engine.config.driver === "NuxtJs") {
          this.$server.all(
            `${engine.driverConfig.config.router.base}*`,
            compiler.render,
          );
          await engine.logRoutes();
          Consumer.servelog.push(engine.driverConfig.config.router.base);
        }
      }

      this.$server.use((req, res, next) => {
        res.status(404).send(Consumer._defaultResponses["404"]);
      });
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }
}
