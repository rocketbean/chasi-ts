import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import NetServer, { SocketRouter } from "../modules/SocketServer/NetServer.js";
export default class SocketServiceProvider
  extends Provider
  implements ServiceProviderInterface {
  public netserver;

  constructor() {
    super();
    this.netserver = new NetServer(
      SocketServiceProvider.$pipe,
      SocketServiceProvider.$observer
    );
  }

  async boot() {
    new SocketRouter("/", {
      container: "container/net/web",
    });
    return this.netserver;
  }

  async beforeServerBoot($app: unknown) {
    SocketServiceProvider.$observer.when("__ready__", async (_prop: unknown, params: unknown) => {
      const { server } = params as { server: import("http").Server };
      try {
        server.on("upgrade", (request, socket, head) => {
          this.netserver.setConnectionRoute(request, socket, head);
        });
      } catch (e: unknown) {
        Logger.log(e);
      }
    });
    await this.netserver.logSockets();
  }
}
