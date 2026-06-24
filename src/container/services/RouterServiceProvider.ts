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
import { chasiVersion } from "../../package/version.js";

export default class RouterServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot() {
    return [
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
        ],
        data: (): {} => {
          return {
            chasiVer: chasiVersion(),
          };
        },
        before: (_request: any, response: any, _data: any) => {
          try {
            response.set("Content-Type", "application/json");
          } catch (e) {}
        },
        displayLog: 1,
      }),
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
    ];
  }

  async beforeRoute($app: any) {
    $app.use(cors(RouterServiceProvider.config.server.cors));
    $app.use(bodyParser.json());
    // Express 5 leaves `req.body` as `undefined` when no parser matched (e.g. a
    // request with no/non-JSON content-type) — Express 4 defaulted it to `{}`.
    // Controllers commonly destructure `request.body`, so default it back to an
    // object: this keeps malformed requests on the graceful validation path
    // (e.g. 422) instead of crashing on a destructure (500).
    $app.use((req: any, _res: any, next: any) => {
      if (req.body === undefined) req.body = {};
      next();
    });
    const publicDir = path.join(___location, "../public");
    // Express 5 changed express.static's `dotfiles` default to "ignore", so
    // dot-directories in public/ (e.g. `.well-known`) now 404. Explicitly allow
    // `.well-known` — needed for Apple Universal Links, Android App Links and
    // ACME/HTTP-01 challenges — while every OTHER dotfile stays inaccessible.
    $app.use(
      "/.well-known",
      express.static(path.join(publicDir, ".well-known"), { dotfiles: "allow" }),
    );
    $app.use(express.static(publicDir));
  }
}
