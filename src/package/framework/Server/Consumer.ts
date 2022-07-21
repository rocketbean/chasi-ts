import { serverConfig, AppException } from "../Interfaces.js";
import exception from "../ErrorHandler/Exception.js";
import Router from "../Router/Router.js";
import Express from "express";
import Exception from "../ErrorHandler/Exception.js";
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
        ...ep.$middlewares,
        async (request, response) => {
          try {
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
            if (!(e instanceof exception)) {
              e = Caveat.handle(e, "APIException");
            }
            ep.addExceptions(e);
            response.status(500).send(e.message);
          }
        },
      );
    }
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
