import { parse } from "url";
import SocketRouter from "./lib/SocketRouter.js";
import Observer from "../../../package/Observer/index.js";

export default class NetServer {
  private static $routers: { [key: string]: SocketRouter } = {};

  /**
   * constructor fn
   * @param $pipe distributes the message
   * within the cluster / workers.
   * @param $observer Observer instance
   */
  constructor(public $pipe?: any, public $observer?: Observer) {
    if (this.$pipe) this.listenToPipe();
    SocketRouter.$observer = this.$observer;
  }

  /** static [register()]
   * registers the server to NetServers
   * router collection
   * @param path [string] path to [WS] server
   * @param router [SocketRouter] router instance
   */
  static register(path: string, router: SocketRouter) {
    NetServer.$routers[path] = router;
  }

  get routers() {
    return NetServer.$routers
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
    this.$pipe.on("websock:channel", (payload) => {
      if (payload.event == "create") {
        NetServer.$routers[payload.transmit.props.path].channel.create(
          payload.transmit.name,
          payload.transmit.props,
          false)
      } else if (payload.event == "send") {
        let ch = NetServer.$routers[payload.transmit.props.path].channel.get(payload.channel)
        ch.send(
          payload.transmit.payload,
          payload.transmit.props,
          false)
      }
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
