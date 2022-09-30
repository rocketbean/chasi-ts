import NetServer from "../NetServer.js";
import EventEmitter from "events";
import Client from "./Client.js";
import chalk from "chalk";
import cluster from "cluster";
import { WebSocketServer } from "ws";
import Base from "../../../../package/Base.js";
import { Iobject } from "../../../../package/framework/Interfaces.js";

export default class SocketRouter extends EventEmitter {
  public static $pipe: any = null;
  public clients = [];
  public events: Iobject = {};
  public evContainer: Function;
  public server: WebSocketServer;
  public opts: Iobject = {
    setDefaultEvents: true,
    container: "",
  };
  public _events;
  private logger = {
    full: Logger.writer("FullCustom"),
    trace: Logger.writer("EndTrace"),
  };

  constructor(public path: string = "", public options: Iobject = {}) {
    super();
    this.opts = Object.assign(this.opts, options);
    this.setup();
  }

  /**
   * emits the event from the payload(message),
   * or firing a cluster event that will trigger
   * a socket event for all threads
   * @param client [Client] client instance that holds the socket data
   * @param message [payload] socket params
   */
  interpolateMessage(client, message) {
    if (cluster.isWorker) {
      message.path = this.path;
      SocketRouter.$pipe.write({
        action: "websock:event",
        transmit: message,
      });
    } else {
      this.emit(message.event, message.payload);
    }
  }

  /**
   * listens to client's socket events,
   * will be disregarded if options[setDefaultEvents]
   * property is disabled.
   * @param client [Client] client instance that holds the socket data
   */
  defaultEvs(client) {
    client.socket.on("message", (message) => {
      try {
        message = message.toString();
        message = JSON.parse(message);
        this.interpolateMessage(client, message);
      } catch (e) {
        throw e;
      }
    });

    client.socket
      .on("close", (sock, code, reason) => {
        this.removeClient(client);
      })
      .on("end", () => {
        this.removeClient(client);
      })
      .on("error", () => {
        this.removeClient(client);
      });
  }

  /**
   * removes the client from the clients collection
   * @param client [Client] client instance that holds the socket data
   */
  removeClient(client) {
    this.clients = this.clients.filter((cl) => cl.id !== client.id);
  }

  /**
   * catch the EventEmitter.emit() method
   * and invoking. this will be usefull for
   * adding middleware before firing the event.
   * @param ev [string] event name
   * @param params [any] event parameters
   * @returns [boolean]
   */
  emit(ev: string, params: any): boolean {
    super.emit(ev, params);
    return true;
  }

  /** [setup()]
   * this method sets up the server
   * and listens to server events
   */
  setup() {
    this.server = new WebSocketServer({
      noServer: true,
      path: this.path,
    })
      .on("connection", (client, request) => {
        if (this.opts.setDefaultEvents) this.defaultEvs(client);
      })
      .on("error", (err) => Logger.log(err));

    Base.fetchSync(this.options.container).then((fn) => {
      this.evContainer = fn.default;
      this.evContainer(this);
    });
    NetServer.register(this.path, this);
  }

  /** [connect()]
   * recieves the upgraded request
   * and emits the [WS:WebSocketServer]
   * connection event.
   * @param sock  [Express:Request]
   * @param request [Express:Socket]
   * @param head [Express:Head]
   */
  connect(sock, request, head) {
    this.server.handleUpgrade(request, sock, head, (socket) => {
      let client = new Client(socket, request, {
        connections: [this.path],
      });
      this.clients.push(client);
      this.server.emit("connection", client, request);
    });
  }

  logSocket() {
    this.logger.full.drawAs(
      ` Socket['${this.path}']::${this.options.container} \n`,
      chalk.bgYellow.black,
      false,
      "services",
    );
    Object.keys(this._events).forEach((ev) => {
      this.logger.trace.write(`╟► @${ev} `, "yellow", "services");
      this.logger.full.drawAs(`\n`, chalk.bgGreen.black, false, "services");
    });
  }
}
