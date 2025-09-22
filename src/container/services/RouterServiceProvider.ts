import {
  ServiceProviderInterface,
  RouterMountable,
} from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import Router from "../../package/statics/Router.js";
import bodyParser from "body-parser";
import cors from "cors";
import CompilerEngine from "../modules/compilerEngine/compiler.js";
import express from "express";
import path from "path";
import { RouterConfigInterface } from "Chasi/Router";

export default class RouterServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot() {
    return [
      new Router(<RouterConfigInterface>{
        name: "chasi",
        auth: false,
        prefix: "/",
        namespace: "container/http/chasi.js",
        ControllerDir: ["container/controllers"],
        middleware: [],
        AuthRouteExceptions: [],
        mount: <RouterMountable[]>[
          {
            name: "engine",
            props: ["web"],
            exec: CompilerEngine.instance,
          },
        ],
        displayLog: 1,
      }),
      new Router(<RouterConfigInterface>{
        name: "api",
        auth: "dev",
        prefix: "/api",
        namespace: "container/http/api.js",
        ControllerDir: ["container/controllers"],
        middleware: [],
        AuthRouteExceptions: [
          { m: "post", url: "/api/users/signin" },
          { m: "post", url: "/api/users/signup" },
          { m: "post", url: "/api/users/forget" },
        ],
        data: (): {} => {
          return {
            chasiVer: "2.4.1",
          };
        },
        before: (request: any, response: any, data: any) => {
          try {
            response.set("Content-Type", "application/json");
          } catch (e) {}
        },
        displayLog: 1,
      }),
    ];
  }

  async beforeRoute($app: any) {
    $app.use(cors(RouterServiceProvider.config.server.cors));
    $app.use(bodyParser.json());
    $app.use(express.static(path.join(___location, "../public")));
  }
}
