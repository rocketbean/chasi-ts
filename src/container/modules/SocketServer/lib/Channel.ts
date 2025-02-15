import { v4 as uuidv4 } from "uuid";

export interface ChannelConstructor {
  new(name: string, config?: ChannelConfig): Channel,
  create(name: string, props?: ChannelConfig, emitter?: boolean);
  _create(name: string, props?: ChannelConfig, emitter?: boolean);
  get(nameOrId: string);
  channels: { [key: string]: Channel }
}

export type ChannelConfig = {
  /** oath?
  * an option to specify 
  * SocketRouter path,
  * useful when emitting an event
  * outside ./net declaration
  */
  path?: string,

  /** messageType?
  * messageType
  */
  messageType?: string,

  /** options
   * this object will be
   * spread along with 
   * the payload when sending
   * message to the client/s.
  */
  options?: object
}

export default class Channel {
  public static $pipe: any = null;
  static channels = {}
  public clients: any[] = [];
  public id: string;
  constructor(public name: string, public props: ChannelConfig) {
    this.id = uuidv4()
  }

  get $pipe() {
    return Channel.$pipe
  }

  get keys() {
    return Object.keys(Channel.channels)
  }

  /**
   * adds the client to the channel
   * @param client [Client] client instance that holds the socket data
   */
  subscribe(client) {
    let _c = this.clients.find(cl => cl.id === client.id)
    if (!_c) this.clients.push(client)
  }

  /**
   * removes the client from the clients collection
   * @param client [Client] client instance that holds the socket data
   */
  unsubscribe(client) {
    this.clients = this.clients.filter((cl) => cl.id !== client.id);
  }

  send(payload, props: ChannelConfig, emitter = true) {
    if (this.$pipe) {
      this.$pipe?.write({
        action: "websock:channel",
        event: "send",
        transmit: { channel: this.name, payload, props }
      })
    }
    this._send(payload, props)
  }
  /**
   * Channel send method
   * will be broadcasted to 
   * all running App instance
   * if serviceCluster is enabled
   * TODO! 
   */
  _send(payload, props: ChannelConfig) {
    if (typeof payload !== "string") payload = { message: payload }
    let { options } = props
    this.clients.map(client => client.send(JSON.stringify({
      event: "channel::message",
      channel: this.name,
      payload,
      ...options
    })))
  }

  static get(nameOrId: string): Channel | null {
    let ch = Channel.channels[nameOrId]
    if (!ch) ch = Object.values(Channel.channels).find(cl => nameOrId === cl["id"])
    if (!ch) ch = false
    return ch;
  }

  /**
   * Channel create method
   * will be broadcasted to 
   * all running App instance
   * if serviceCluster is enabled
   * TODO! 
   */
  static create(name: string, props: ChannelConfig, emitter = true) {
    if (this.$pipe) {
      this.$pipe.write({
        action: "websock:channel",
        event: "create",
        transmit: { name, props }
      })
    }
    return Channel._create(name, props)
  }

  static _create(name: string, props: ChannelConfig, emitter = true): Channel {
    let ch = Channel.channels[name]
    if (!Channel.channels[name]) {
      ch = new Channel(name, props)
      Channel.channels[name] = ch
    }
    return ch;
  }

  /**
   * Channel remove method
   * will be broadcasted to 
   * all running App instance
   * if serviceCluster is enabled
   * TODO! 
   */
  static remove(name: string): void {
    if (!Channel.channels[name]) throw new Error("NetServerErr:: Channel does not exist")
    delete Channel.channels[name]
  }
}