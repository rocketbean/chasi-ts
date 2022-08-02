import { serverConfig, AppException } from "../Interfaces.js";
import exception from "../ErrorHandler/Exception.js";
import Router from "../Router/Router.js";
import Express from "express";
import cors from "cors";
import Exception from "../ErrorHandler/Exception.js";
import Models from "../Database/Models.js";
import cluster from "cluster";

export default class Consumer {
  $server: any = Express();
  /****
   * Router Consumer
   * registers the routing layer
   * to the [Express]server
   */
  public $routers: Router[] = [];
  constructor(public config: serverConfig) {
    this.config = config;
  }

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
            let status = e.status ? e.status : 500;
            if (!(e instanceof exception)) {
              e = Caveat.handle(e, "APIException");
            }
            ep.addExceptions(e);
            response.status(status).send(e.message);
          }
          if (this.config.serviceCluster.enabled) cluster.worker.kill();
        },
      );
    }
  }

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

  async consumeLayers() {
    for (let r in this.$routers) {
      let router = this.$routers[r];
      await this.consume(router);
    }

    this.$server.use((req, res, next) => {
      res.send("unknown request");
    });
  }
}
