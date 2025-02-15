import NetServer from "../NetServer.js";
import EventEmitter from "events";
import Client from "./Client.js";
import chalk from "chalk";
import cluster from "cluster";
import Channel, { ChannelConstructor } from "./Channel.js";
import { WebSocketServer } from "ws";
import Base from "../../../../package/Base.js";
import { Iobject } from "../../../../package/framework/Interfaces.js";
import Observer from "../../../../package/Observer/index.js";

export type SockServerOptions = {
  setDefaultEvents?: boolean,
  container: string
}

export default class SocketRouter extends EventEmitter {
  public static $pipe: any = null;
  public static $observer: Observer | null = null;
  public clients = [];
  public events: Iobject = {};
  public evContainer: Function;
  public server: WebSocketServer;
  public opts: SockServerOptions = {
    setDefaultEvents: true,
    container: "",
  };
  public _events;
  public channel: ChannelConstructor = Channel

  private logger = {
    full: Logger.writer("FullCustom"),
    trace: Logger.writer("EndTrace"),
  };

  constructor(public path: string = "", public options: SockServerOptions) {
    super();
    this.opts = <SockServerOptions>Object.assign(this.opts, options);
    this.setup();
  }

  get $pipe() {
    return SocketRouter.$pipe
  }

  /**
   * emits the event from the payload(message),
   * or firing a cluster event that will trigger
   * a socket event for all threads
   * @param client [Client] client instance that holds the socket data
   * @param message [payload] socket params
   */
  async interpolateMessage(client, message) {
    if (!cluster.isWorker && SocketRouter.$pipe) {
      message.path = this.path;
      SocketRouter.$pipe.write({
        action: "websock:event",
        transmit: message,
      });
    } else {
      this.emit(message.event, message.payload, client);
      // if (SocketRouter?.$pipe) {
      await this.linkObserverEvent(client, message)
      // }
    }
  }

  async linkObserverEvent(client, message) {
    let event = message.event;
    let key = "NS["
    let regx = /\[([^}]+)\]/s
    // Logger.log(Object.keys(SocketRouter.$observer.$events))
    Object.keys(SocketRouter.$observer.$events).map(async ev => {
      if (event.includes(key)) {
        await SocketRouter.$observer.emit(event, { client, message })
      }
    })
  }

  /**
   * listens to client's socket events,
   * will be disregarded if options[setDefaultEvents]
   * property is disabled.
   * @param client [Client] client instance that holds the socket data
   */
  defaultEvs(client) {
    client.socket.on("message", async (message) => {
      try {
        message = message.toString();
        message = JSON.parse(message);
        await this.interpolateMessage(client, message);
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
  emit(ev: string, params: any, client?: any): boolean {
    super.emit(ev, params, client);
    return true;
  }

  /** [setup()]
   * this method sets up the server
   * and listens to server events
   * 
   * WebSocketServer [noServer] is enabled
   * to avoid conflicts to the running http server
   * @returns void
   */
  setup() {
    Channel.$pipe = SocketRouter.$pipe
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
   * @param sock  [WS:Socket]
   * @param request [WS:Request]
   * @param head [WS:Head]
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
      ` SocketServer['${this.path}']<${this.options.container}> \n`,
      chalk.bgYellow.black,
      false,
      "services",
    );
    Object.keys(this._events).forEach((ev) => {
      this.logger.trace.write(`╟► @${ev} `, "yellow", "services");
      this.logger.full.drawAs(`\n`, chalk.bgGreen.black, false, "services");
    });
    this.logger.full.drawAs(`\n`, chalk.bgGreen.black, false, "services");
  }
}
