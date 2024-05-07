import {
  ServiceProviderInterface,
  RouterConfigInterface,
  RouterMountable,
} from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import Router from "../../package/statics/Router.js";
import bodyParser from "body-parser";
import cors from "cors";
import CompilerEngine from "../modules/compilerEngine/compiler.js";

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
        data: (): {} => {
          return {
            chasiVer: "2.3.5"
          };
        },
        mount: <RouterMountable[]>[
          {
            name: "engine",
            props: ["web"],
            exec: CompilerEngine.instance,
          },
        ],
        before: (request, response) => {},
        after: (request, response) => {},
        displayLog: 1,
      }),
    ];
  }

  async beforeRoute($app: any) {
    $app.use(cors(RouterServiceProvider.config.server.cors));
    $app.use(bodyParser.json());
  }
}
