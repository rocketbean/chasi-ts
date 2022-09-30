import { Iobject } from "../../../package/framework/Interfaces.js";
import { parse } from "url";
import SocketRouter from "./lib/SocketRouter.js";

export default class NetServer {
  private static $routers: Iobject = {};

  constructor(public $pipe?: any) {
    if (this.$pipe) this.listenToPipe();
  }

  /** static [register()]
   * registers the server to NetServers
   * router collection
   * @param path [string] path to [WS] server
   * @param router [SocketRouter] router instance
   */
  static register(path, router) {
    NetServer.$routers[path] = router;
  }

  /** [listenToPipe()]
   * this method will be fired when cluster is enabled,
   * this method will ensure that fired events is
   * synchronized to all forks/workers
   */
  listenToPipe() {
    SocketRouter.$pipe = this.$pipe;
    this.$pipe.on("socket:fire", (payload) => {
      payload = payload.transmit;
      NetServer.$routers[payload.path].emit(payload.event, payload.payload);
    });
  }

  /** [setConnectionRoute()]
   * recieves the "upgraded" connection requests
   * and maps the request url to a specific
   * socket router.
   * @params request [Express:Request]
   * @params socket [Express:Socket]
   * @params head [Express:Head]
   * @returns void
   */
  setConnectionRoute(request, socket, head): void {
    const { pathname } = parse(request.url);
    Object.keys(NetServer.$routers).map((serv) => {
      if (pathname == serv) {
        NetServer.$routers[serv].connect(socket, request, head);
      }
    });
  }

  async logSockets() {
    Object.keys(NetServer.$routers).map((serv) => {
      NetServer.$routers[serv].logSocket();
    });
  }
}

export { SocketRouter };
