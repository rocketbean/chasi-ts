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
  container: string,
  /** Validate the upgrade request. Return the authenticated user or throw to reject. */
  auth?: (request: any) => Promise<any> | any,
  /** Ping interval in ms. Terminates connections that don't pong back. 0 = disabled. Default: 30000 */
  heartbeat?: number,
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
    heartbeat: 30000,
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
    // Always fire locally — the connected client lives on this worker
    this.emit(message.event, message.payload, client);
    await this.linkObserverEvent(client, message);

    // Forward to other workers so their connected clients also receive the event.
    // Only workers write to the pipe; the primary thread never processes WS messages.
    if (cluster.isWorker && SocketRouter.$pipe) {
      await SocketRouter.$pipe.write({
        action: "websock:event",
        transmit: { ...message, path: this.path },
      });
    }
  }

  async linkObserverEvent(client, message) {
    const event = message.event;
    // NS[...] events are namespaced observer events — emit once, not per registered handler
    if (event.startsWith("NS[") && SocketRouter.$observer) {
      await SocketRouter.$observer.emit(event, { client, message });
    }
  }

  /**
   * listens to client's socket events,
   * will be disregarded if options[setDefaultEvents]
   * property is disabled.
   * @param client [Client] client instance that holds the socket data
   */
  defaultEvs(client) {
    client.socket.on("pong", () => {
      client._alive = true;
    });

    client.socket.on("message", async (message) => {
      try {
        message = JSON.parse(message.toString());
        await this.interpolateMessage(client, message);
      } catch (e) {
        client.sendEvent("error", { message: "Invalid message format or handler error." });
      }
    });

    client.socket
      .on("close", () => this.removeClient(client))
      .on("end",   () => this.removeClient(client))
      .on("error", () => this.removeClient(client));
  }

  /**
   * removes the client from the clients collection
   * @param client [Client] client instance that holds the socket data
   */
  removeClient(client) {
    this.clients = this.clients.filter((cl) => cl.id !== client.id);
    this.emit("disconnect", {}, client);
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
        this.emit("connect", {}, client);
      })
      .on("error", (err) => Logger.log(err));

    Base.fetchSync(this.options.container).then((fn: any) => {
      this.evContainer = fn.default;
      this.evContainer(this);
    });

    if (this.opts.heartbeat) this.startHeartbeat(this.opts.heartbeat);
    NetServer.register(this.path, this);
  }

  /** [startHeartbeat()]
   * pings all clients on the given interval and terminates
   * any that do not respond with a pong — cleans up ghost connections.
   */
  startHeartbeat(interval: number) {
    const timer = setInterval(() => {
      this.clients = this.clients.filter((client) => {
        if (!client._alive) {
          client.socket.terminate();
          return false;
        }
        client._alive = false;
        client.socket.ping();
        return true;
      });
    }, interval);
    this.server.on("close", () => clearInterval(timer));
  }

  /** [connect()]
   * receives the upgraded request, runs optional auth, and emits the
   * [WS:WebSocketServer] connection event.
   * @param sock    [WS:Socket]
   * @param request [WS:Request]
   * @param head    [WS:Head]
   */
  async connect(sock, request, head) {
    let user: any = null;

    if (this.opts.auth) {
      try {
        user = await this.opts.auth(request);
      } catch (e) {
        sock.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        sock.destroy();
        return;
      }
    }

    this.server.handleUpgrade(request, sock, head, (socket) => {
      let client = new Client(socket, request, { connections: [this.path] });
      client.user = user;
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
