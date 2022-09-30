import { Iobject } from "../../../../package/framework/Interfaces.js";
import { v4 as uuidv4 } from "uuid";

export default class Client {
  public id = uuidv4();

  constructor(public socket, public request?, public property: Iobject = {}) {}

  send(payload) {
    this.socket.send(payload);
  }
}
